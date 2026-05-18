import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DocumentType {
  id: string;
  docName: string;
  fee: number;
  prerequisites: string[];
  processingDays: number;
}

export interface DocumentRequest {
  id: string;
  requesterUid: string;
  requesterName: string;
  studentId?: string;
  documentTypeId: string;
  documentTypeName: string;
  status: 'Pending' | 'Processing' | 'Approved' | 'Ready for Download' | 'Rejected';
  dateSubmitted: string;
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
  timestamp: string;
}

interface DataContextType {
  documentTypes: DocumentType[];
  requests: DocumentRequest[];
  auditLogs: AuditLog[];
  addDocumentType: (docType: Omit<DocumentType, 'id'>) => void;
  updateDocumentType: (id: string, docType: Partial<DocumentType>) => void;
  deleteDocumentType: (id: string) => void;
  submitRequest: (request: Omit<DocumentRequest, 'id' | 'dateSubmitted' | 'status'>) => void;
  updateRequestStatus: (requestId: string, status: DocumentRequest['status'], actorUid: string, actorName: string, notes?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'dt-001',
    docName: 'Official Transcript',
    fee: 150,
    prerequisites: ['Clearance', 'Valid ID'],
    processingDays: 5
  },
  {
    id: 'dt-002',
    docName: 'Certificate of Enrollment',
    fee: 50,
    prerequisites: ['Valid ID'],
    processingDays: 1
  },
  {
    id: 'dt-003',
    docName: 'Certificate of Grades',
    fee: 100,
    prerequisites: ['Clearance'],
    processingDays: 3
  },
  {
    id: 'dt-004',
    docName: 'Diploma',
    fee: 500,
    prerequisites: ['Clearance', 'Valid ID', 'Graduation Photo'],
    processingDays: 14
  }
];

const INITIAL_REQUESTS: DocumentRequest[] = [
  {
    id: 'req-001',
    requesterUid: 'student-001',
    requesterName: 'John Doe',
    studentId: '2024-001234',
    documentTypeId: 'dt-001',
    documentTypeName: 'Official Transcript',
    status: 'Processing',
    dateSubmitted: '2026-05-15T10:30:00Z',
    fee: 150
  },
  {
    id: 'req-002',
    requesterUid: 'student-002',
    requesterName: 'Alice Johnson',
    studentId: '2024-005678',
    documentTypeId: 'dt-002',
    documentTypeName: 'Certificate of Enrollment',
    status: 'Ready for Download',
    dateSubmitted: '2026-05-14T14:20:00Z',
    fee: 50,
    downloadUrl: '#'
  },
  {
    id: 'req-003',
    requesterUid: 'student-003',
    requesterName: 'Bob Smith',
    studentId: '2024-009012',
    documentTypeId: 'dt-003',
    documentTypeName: 'Certificate of Grades',
    status: 'Pending',
    dateSubmitted: '2026-05-18T09:15:00Z',
    fee: 100
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(INITIAL_DOCUMENT_TYPES);
  const [requests, setRequests] = useState<DocumentRequest[]>(INITIAL_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const addDocumentType = (docType: Omit<DocumentType, 'id'>) => {
    const newDocType: DocumentType = {
      ...docType,
      id: `dt-${Date.now()}`
    };
    setDocumentTypes([...documentTypes, newDocType]);
  };

  const updateDocumentType = (id: string, docType: Partial<DocumentType>) => {
    setDocumentTypes(documentTypes.map(dt =>
      dt.id === id ? { ...dt, ...docType } : dt
    ));
  };

  const deleteDocumentType = (id: string) => {
    setDocumentTypes(documentTypes.filter(dt => dt.id !== id));
  };

  const submitRequest = (request: Omit<DocumentRequest, 'id' | 'dateSubmitted' | 'status'>) => {
    const newRequest: DocumentRequest = {
      ...request,
      id: `req-${Date.now()}`,
      dateSubmitted: new Date().toISOString(),
      status: 'Pending'
    };
    setRequests([newRequest, ...requests]);
  };

  const updateRequestStatus = (
    requestId: string,
    status: DocumentRequest['status'],
    actorUid: string,
    actorName: string,
    notes?: string
  ) => {
    setRequests(requests.map(req =>
      req.id === requestId
        ? { ...req, status, notes, downloadUrl: status === 'Ready for Download' ? '#mock-download-url' : req.downloadUrl }
        : req
    ));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      requestId,
      action: `Status changed to ${status}`,
      actorUid,
      actorName,
      timestamp: new Date().toISOString()
    };
    setAuditLogs([...auditLogs, newLog]);
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
      updateRequestStatus
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
