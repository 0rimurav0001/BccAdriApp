package com.bcc.adri.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bcc.adri.data.model.DocumentRequest
import com.bcc.adri.data.model.PendingRegistration
import com.bcc.adri.data.model.User
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

import com.google.firebase.storage.FirebaseStorage
import android.net.Uri

class AdminViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()
    private val storage = FirebaseStorage.getInstance()

    private val _allRequests = MutableStateFlow<List<DocumentRequest>>(emptyList())
    val allRequests: StateFlow<List<DocumentRequest>> = _allRequests.asStateFlow()

    private val _pendingRegistrations = MutableStateFlow<List<PendingRegistration>>(emptyList())
    val pendingRegistrations: StateFlow<List<PendingRegistration>> = _pendingRegistrations.asStateFlow()

    private val _allUsers = MutableStateFlow<List<User>>(emptyList())
    val allUsers: StateFlow<List<User>> = _allUsers.asStateFlow()

    init {
        fetchAllRequests()
        fetchPendingRegistrations()
        fetchAllUsers()
    }

    private fun fetchAllRequests() {
        db.collection("requests")
            .orderBy("dateSubmitted", Query.Direction.DESCENDING)
            .addSnapshotListener { value, error ->
                if (error != null) return@addSnapshotListener
                val list = value?.documents?.mapNotNull { it.toObject(DocumentRequest::class.java)?.copy(id = it.id) }
                _allRequests.value = list ?: emptyList()
            }
    }

    private fun fetchPendingRegistrations() {
        db.collection("pendingRegistrations")
            .whereEqualTo("status", "pending")
            .orderBy("dateSubmitted", Query.Direction.DESCENDING)
            .addSnapshotListener { value, error ->
                if (error != null) return@addSnapshotListener
                val list = value?.documents?.mapNotNull { it.toObject(PendingRegistration::class.java)?.copy(id = it.id) }
                _pendingRegistrations.value = list ?: emptyList()
            }
    }

    private fun fetchAllUsers() {
        db.collection("users")
            .addSnapshotListener { value, error ->
                if (error != null) return@addSnapshotListener
                val list = value?.documents?.mapNotNull { it.toObject(User::class.java)?.copy(uid = it.id) }
                _allUsers.value = list ?: emptyList()
            }
    }

    fun approveRegistration(registration: PendingRegistration, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                val userProfile = User(
                    uid = registration.id,
                    email = registration.email,
                    fullName = registration.fullName,
                    role = "student",
                    studentId = registration.studentId,
                    course = registration.course,
                    yearLevel = registration.yearLevel,
                    status = "active"
                )
                db.collection("users").document(registration.id).set(userProfile).await()
                db.collection("pendingRegistrations").document(registration.id)
                    .update("status", "approved").await()
                onComplete(true)
            } catch (e: Exception) {
                onComplete(false)
            }
        }
    }

    fun updateRequestStatus(requestId: String, newStatus: String, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                db.collection("requests").document(requestId)
                    .update("status", newStatus).await()
                onComplete(true)
            } catch (e: Exception) {
                onComplete(false)
            }
        }
    }

    fun uploadDocument(requestId: String, fileUri: Uri, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                val fileRef = storage.reference.child("issued_documents/$requestId/${fileUri.lastPathSegment}")
                val uploadTask = fileRef.putFile(fileUri).await()
                val downloadUrl = fileRef.downloadUrl.await().toString()

                db.collection("requests").document(requestId).update(
                    "downloadUrl", downloadUrl,
                    "status", "Ready for Download"
                ).await()
                onComplete(true)
            } catch (e: Exception) {
                onComplete(false)
            }
        }
    }

    fun toggleUserStatus(userId: String, currentStatus: String, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                val newStatus = if (currentStatus == "active") "suspended" else "active"
                db.collection("users").document(userId)
                    .update("status", newStatus).await()
                onComplete(true)
            } catch (e: Exception) {
                onComplete(false)
            }
        }
    }
}
