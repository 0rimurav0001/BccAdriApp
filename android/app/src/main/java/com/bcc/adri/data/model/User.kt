package com.bcc.adri.data.model

data class User(
    val uid: String = "",
    val email: String = "",
    val fullName: String = "",
    val role: String = "student",
    val studentId: String? = null,
    val course: String? = null,
    val yearLevel: String? = null,
    val status: String = "active" // active, suspended
)

data class PendingRegistration(
    val id: String = "",
    val email: String = "",
    val fullName: String = "",
    val studentId: String = "",
    val course: String = "",
    val yearLevel: String = "",
    val phoneNumber: String = "",
    val status: String = "pending", // pending, approved, rejected
    val dateSubmitted: com.google.firebase.Timestamp? = null
)
