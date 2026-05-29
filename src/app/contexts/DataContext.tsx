import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from './AuthContext';

export interface DocumentType {
  id: string;
  docName: string;
  fee: number;
  prerequisites: string[];
  processingDays: number;
  isActive: boolean;
}

export interface DocumentRequest {
  id: string;
  requesterUid: string;
  requesterName: string;
  studentId?: string;
  documentTypeId: string;
  documentTypeName: string;
  status: 'Pending' | 'Processing' | 'Approved' | 'Ready for Download' | 'Rejected';
  dateSubmitted: any;
  downloadUrl?: string;
  fee: number;
  notes?: string;
}

export interface AuditLog {
  id: string;
  requestId: string;
  action: string;
  actorUid: string;
  actorName: string;
  timestamp: any;
}

interface DataContextType {
  documentTypes: DocumentType[];
  requests: DocumentRequest[];
  auditLogs: AuditLog[];
  addDocumentType: (docType: Omit<DocumentType, 'id'>) => Promise<void>;
  updateDocumentType: (id: string, docType: Partial<DocumentType>) => Promise<void>;
  deleteDocumentType: (id: string) => Promise<void>;
  submitRequest: (request: Omit<DocumentRequest, 'id' | 'dateSubmitted' | 'status'>) => Promise<void>;
  updateRequestStatus: (requestId: string, status: DocumentRequest['status'], actorUid: string, actorName: string, notes?: string) => Promise<void>;
  uploadProcessedDocument: (requestId: string, file: File, actorUid: string, actorName: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Listen for Document Types
    const dtQuery = query(collection(db, 'documentTypes'));
    const unsubscribeDT = onSnapshot(dtQuery, (snapshot) => {
      const dts: DocumentType[] = [];
      snapshot.forEach((doc) => {
        dts.push({ id: doc.id, ...doc.data() } as DocumentType);
      });
      setDocumentTypes(dts);
    });

    // Listen for Requests
    // If user is student, only show their requests
    let reqQuery;
    if (user?.role === 'student') {
      reqQuery = query(
        collection(db, 'requests'),
        where('requesterUid', '==', user.uid),
        orderBy('dateSubmitted', 'desc')
      );
    } else {
      reqQuery = query(collection(db, 'requests'), orderBy('dateSubmitted', 'desc'));
    }

    const unsubscribeReq = onSnapshot(reqQuery, (snapshot) => {
      const reqs: DocumentRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reqs.push({
          id: doc.id,
          ...data,
          dateSubmitted: data.dateSubmitted?.toDate?.()?.toISOString() || new Date().toISOString()
        } as DocumentRequest);
      });
      setRequests(reqs);
    });

    return () => {
      unsubscribeDT();
      unsubscribeReq();
    };
  }, [user]);

  const addDocumentType = async (docType: Omit<DocumentType, 'id'>) => {
    await addDoc(collection(db, 'documentTypes'), {
      ...docType,
      isActive: true
    });
  };

  const updateDocumentType = async (id: string, docType: Partial<DocumentType>) => {
    await updateDoc(doc(db, 'documentTypes', id), docType);
  };

  const deleteDocumentType = async (id: string) => {
    await deleteDoc(doc(db, 'documentTypes', id));
  };

  const submitRequest = async (request: Omit<DocumentRequest, 'id' | 'dateSubmitted' | 'status'>) => {
    await addDoc(collection(db, 'requests'), {
      ...request,
      status: 'Pending',
      dateSubmitted: serverTimestamp()
    });
  };

  const updateRequestStatus = async (
    requestId: string,
    status: DocumentRequest['status'],
    actorUid: string,
    actorName: string,
    notes?: string
  ) => {
    const updates: any = { status };
    if (notes) updates.notes = notes;

    await updateDoc(doc(db, 'requests', requestId), updates);

    await addDoc(collection(db, 'auditLogs'), {
      requestId,
      action: `Status changed to ${status}`,
      actorUid,
      actorName,
      timestamp: serverTimestamp()
    });
  };

  const uploadProcessedDocument = async (requestId: string, file: File, actorUid: string, actorName: string) => {
    // 1. Upload to Firebase Storage
    const fileRef = ref(storage, `processed_documents/${requestId}/${file.name}`);
    await uploadBytes(fileRef, file);

    // 2. Get Download URL
    const downloadUrl = await getDownloadURL(fileRef);

    // 3. Update Firestore Request
    await updateDoc(doc(db, 'requests', requestId), {
      status: 'Ready for Download',
      downloadUrl: downloadUrl
    });

    // 4. Log Action
    await addDoc(collection(db, 'auditLogs'), {
      requestId,
      action: 'Document uploaded and ready for download',
      actorUid,
      actorName,
      timestamp: serverTimestamp()
    });
  };

  return (
    <DataContext.Provider value={{
      documentTypes,
      requests,
      auditLogs,
      addDocumentType,
      updateDocumentType,
      deleteDocumentType,
      submitRequest,
      updateRequestStatus,
      uploadProcessedDocument
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
