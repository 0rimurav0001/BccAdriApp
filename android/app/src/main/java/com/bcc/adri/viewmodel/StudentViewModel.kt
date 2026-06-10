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

class StudentViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()
    
    private val _requests = MutableStateFlow<List<DocumentRequest>>(emptyList())
    val requests: StateFlow<List<DocumentRequest>> = _requests.asStateFlow()

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    fun fetchUserData(uid: String) {
        db.collection("users").document(uid).addSnapshotListener { value, error ->
            if (error != null) return@addSnapshotListener
            _currentUser.value = value?.toObject(User::class.java)
        }
    }

    fun fetchRequests(uid: String) {
        db.collection("requests")
            .whereEqualTo("requesterUid", uid)
            .orderBy("dateSubmitted", Query.Direction.DESCENDING)
            .addSnapshotListener { value, error ->
                if (error != null) return@addSnapshotListener
                
                val list = value?.documents?.mapNotNull { it.toObject(DocumentRequest::class.java)?.copy(id = it.id) }
                _requests.value = list ?: emptyList()
            }
    }

    fun registerStudent(registration: PendingRegistration, password: String, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                val data = hashMapOf(
                    "email" to registration.email,
                    "fullName" to registration.fullName,
                    "studentId" to registration.studentId,
                    "course" to registration.course,
                    "yearLevel" to registration.yearLevel,
                    "phoneNumber" to registration.phoneNumber,
                    "password" to password,
                    "status" to "pending",
                    "dateSubmitted" to registration.dateSubmitted
                )
                db.collection("pendingRegistrations").add(data)
                onComplete(true)
            } catch (e: Exception) {
                onComplete(false)
            }
        }
    }

    fun submitRequest(request: DocumentRequest, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                db.collection("requests").add(request)
                onComplete(true)
            } catch (e: Exception) {
                onComplete(false)
            }
        }
    }
}
