package com.bcc.adri.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bcc.adri.data.model.DocumentRequest
import com.bcc.adri.data.model.User

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StaffDashboardScreen(
    staffUser: User?,
    requests: List<DocumentRequest>,
    onUpdateStatus: (String, String) -> Unit,
    onUploadDocument: (String, Uri) -> Unit,
    onLogout: () -> Unit
) {
    var showProfile by remember { mutableStateOf(false) }
    val processingRequests = requests.filter { it.status == "Processing" || it.status == "Pending" }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("BCC Staff Portal", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { showProfile = !showProfile }) { 
                        Icon(Icons.Default.AccountCircle, "Profile") 
                    }
                    IconButton(onClick = onLogout) { Icon(Icons.Default.ExitToApp, "Logout") }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.secondary,
                    titleContentColor = Color.White,
                    actionIconContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // Staff Profile
            AnimatedVisibility(visible = showProfile) {
                Card(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Staff Profile", fontWeight = FontWeight.Bold)
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        ProfileDetailItem(label = "Name", value = staffUser?.fullName ?: "Staff Member")
                        ProfileDetailItem(label = "Email", value = staffUser?.email ?: "staff@bcc.edu")
                    }
                }
            }

            // Processing Overview
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard("To Process", processingRequests.size.toString(), Modifier.weight(1f), Icons.Default.DateRange)
                StatCard("Total Work", requests.size.toString(), Modifier.weight(1f), Icons.Default.List)
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text("Active Workload", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text("Requests requiring immediate attention", fontSize = 12.sp, color = Color.Gray)
            
            Spacer(modifier = Modifier.height(12.dp))

            if (processingRequests.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No active work. Good job!")
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(processingRequests) { request ->
                        StaffRequestItem(request, onUpdateStatus, onUploadDocument)
                    }
                }
            }
        }
    }
}

@Composable
fun StaffRequestItem(
    request: DocumentRequest, 
    onUpdateStatus: (String, String) -> Unit,
    onUploadDocument: (String, Uri) -> Unit
) {
    val filePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { onUploadDocument(request.id, it) }
    }

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(request.requesterName, fontWeight = FontWeight.Bold)
                    Text(request.documentTypeName, fontSize = 14.sp)
                    Text("Status: ${request.status}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (request.status == "Pending") {
                    Button(
                        onClick = { onUpdateStatus(request.id, "Processing") },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Start Processing")
                    }
                } else if (request.status == "Processing") {
                    Button(
                        onClick = { filePicker.launch("application/pdf") },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50))
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Upload & Complete")
                    }
                }
                
                OutlinedButton(
                    onClick = { /* Reject with reason */ },
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.Red),
                    modifier = Modifier.width(100.dp)
                ) {
                    Text("Reject")
                }
            }
        }
    }
}
