import { Database, Shield, Cloud, Bell, CheckCircle, Code } from 'lucide-react';

export function DocumentationSite() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">System Documentation</h2>
        <p className="text-sm text-gray-500 mt-1">Architecture, API endpoints, and implementation guide</p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
        <p className="text-sm text-blue-700">
          This documentation covers the Firebase-based architecture for the Academic Document Request & Issuance system.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">System Architecture</h3>
        <p className="text-sm text-gray-600 mb-6">
          The system is built on Firebase services to provide a scalable, secure, and real-time document management platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Authentication</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Firebase Authentication with Custom Claims</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Email/Password
              </span>
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Google Sign-In
              </span>
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                RBAC
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Database</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Cloud Firestore (NoSQL)</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Real-time
              </span>
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Scalable
              </span>
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Offline Support
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Cloud className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Storage</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Firebase Cloud Storage</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Document Vault
              </span>
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Secure URLs
              </span>
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                CDN
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Notifications</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Firebase Cloud Messaging (FCM)</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Push Notifications
              </span>
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Triggers
              </span>
              <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                Real-time
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Firestore Database Structure</h3>

        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-gray-900">users (Collection)</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">Document ID: Firebase Auth UID</p>
            <div className="bg-gray-50 p-3 rounded-xl font-mono text-xs text-gray-700">
              <div>fullName: string</div>
              <div>studentId: string</div>
              <div>course: string</div>
              <div>yearLevel: string</div>
              <div>role: "student" | "staff" | "admin"</div>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-gray-900">document_types (Collection)</h4>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl font-mono text-xs text-gray-700">
              <div>docName: string</div>
              <div>fee: number</div>
              <div>prerequisites: string[]</div>
              <div>processingDays: number</div>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-gray-900">requests (Collection)</h4>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl font-mono text-xs text-gray-700">
              <div>requesterUid: string</div>
              <div>documentTypeId: string</div>
              <div>status: "Pending" | "Processing" | "Approved" | "Ready for Download" | "Rejected"</div>
              <div>dateSubmitted: timestamp</div>
              <div>downloadUrl?: string</div>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-gray-900">requests/{'{requestId}'}/audit_logs (Subcollection)</h4>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl font-mono text-xs text-gray-700">
              <div>action: string</div>
              <div>actorUid: string</div>
              <div>timestamp: timestamp</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Implementation</h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Firebase Security Rules</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Students can only read/write their own requests. Staff can read all requests and update statuses.
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /requests/{requestId} {
      allow read: if request.auth != null &&
        (resource.data.requesterUid == request.auth.uid ||
         request.auth.token.staff == true ||
         request.auth.token.admin == true);

      allow create: if request.auth != null &&
        request.resource.data.requesterUid == request.auth.uid;

      allow update: if request.auth != null &&
        (request.auth.token.staff == true ||
         request.auth.token.admin == true);
    }
  }
}`}</pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Cloud Functions</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">Server-side triggers for secure business logic:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>Status update validation with custom claims verification</li>
              <li>Audit log creation for all status changes</li>
              <li>PDF generation for issued documents</li>
              <li>FCM notification triggers on status changes</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Firebase App Check</h4>
            </div>
            <p className="text-sm text-gray-600">
              Uses Play Integrity API to ensure requests originate from legitimate Android app installations,
              preventing unauthorized backend access.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Integration Guide</h3>

        <p className="text-sm text-gray-600 mb-4">
          This web portal can integrate with the Android app through Firebase's real-time synchronization.
        </p>

        <div className="space-y-3">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
            <h4 className="font-semibold text-green-900 text-sm mb-1">Real-time Updates</h4>
            <p className="text-sm text-green-800">
              Both web and mobile clients listen to Firestore snapshots, ensuring instant synchronization
              when staff updates request statuses.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
            <h4 className="font-semibold text-green-900 text-sm mb-1">Shared Authentication</h4>
            <p className="text-sm text-green-800">
              Firebase Auth tokens with custom claims work seamlessly across web and mobile platforms.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
            <h4 className="font-semibold text-green-900 text-sm mb-1">Unified Storage</h4>
            <p className="text-sm text-green-800">
              Documents uploaded via mobile are instantly accessible on web, and vice versa, through Cloud Storage URLs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
