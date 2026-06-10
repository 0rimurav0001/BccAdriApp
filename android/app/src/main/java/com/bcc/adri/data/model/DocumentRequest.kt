package com.bcc.adri.data.model

import com.google.firebase.Timestamp

data class DocumentRequest(
    val id: String = "",
    val requesterUid: String = "",
    val requesterName: String = "",
    val studentId: String = "",
    val documentTypeName: String = "",
    val status: String = "Pending", // Pending, Processing, Approved, Ready for Download, Rejected
    val dateSubmitted: Timestamp? = null,
    val fee: Double = 0.0,
    val downloadUrl: String? = null,
    val notes: String? = null
)
