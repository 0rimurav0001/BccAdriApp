package com.bcc.adri.ui.screens

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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bcc.adri.data.model.DocumentRequest
import com.bcc.adri.data.model.PendingRegistration
import com.bcc.adri.data.model.User

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(
    adminUser: User?,
    requests: List<DocumentRequest>,
    pendingRegs: List<PendingRegistration>,
    onUpdateStatus: (String, String) -> Unit,
    onNavigateToPending: () -> Unit,
    onNavigateToUsers: () -> Unit,
    onNavigateToReport: (String) -> Unit,
    onLogout: () -> Unit
) {
    var showProfile by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("BCC Admin Panel", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { showProfile = !showProfile }) { 
                        Icon(Icons.Default.AccountCircle, "Profile") 
                    }
                    IconButton(onClick = onNavigateToUsers) { 
                        Icon(Icons.Default.Settings, "Manage Accounts") 
                    }
                    IconButton(onClick = onLogout) { Icon(Icons.Default.ExitToApp, "Logout") }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
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
            // Admin Profile Section
            AnimatedVisibility(visible = showProfile) {
                Card(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Admin Profile", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        ProfileDetailItem(label = "Full Name", value = adminUser?.fullName ?: "Administrator")
                        ProfileDetailItem(label = "Email", value = adminUser?.email ?: "admin@bcc.edu")
                        ProfileDetailItem(label = "Role", value = adminUser?.role?.uppercase() ?: "ADMIN")
                    }
                }
            }

            // Stats Cards / Quick Reports
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard("Pending Requests", requests.count { it.status == "Pending" }.toString(), Modifier.weight(1f), Icons.Default.Info) {
                    onNavigateToReport("Pending")
                }
                StatCard("New Registrations", pendingRegs.size.toString(), Modifier.weight(1f), Icons.Default.Email) {
                    onNavigateToPending()
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard("Approved", requests.count { it.status == "Approved" }.toString(), Modifier.weight(1f), Icons.Default.Check) {
                    onNavigateToReport("Approved")
                }
                StatCard("Completed", requests.count { it.status == "Ready for Download" }.toString(), Modifier.weight(1f), Icons.Default.Done) {
                    onNavigateToReport("Ready for Download")
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text("Recent Requests", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(12.dp))

            if (requests.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No requests found.")
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(requests.take(10)) { request ->
                        AdminRequestItem(request, onUpdateStatus)
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(label: String, value: String, modifier: Modifier, icon: ImageVector, onClick: (() -> Unit)? = null) {
    Card(
        modifier = modifier.height(100.dp),
        onClick = { onClick?.invoke() },
        enabled = onClick != null
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(12.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Text(value, fontSize = 24.sp, fontWeight = FontWeight.Black)
            Text(label, fontSize = 12.sp, color = Color.Gray)
        }
    }
}

@Composable
fun AdminRequestItem(request: DocumentRequest, onUpdateStatus: (String, String) -> Unit) {
    var showDialog by remember { mutableStateOf(false) }
    
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(request.requesterName, fontWeight = FontWeight.Bold)
                Text(request.documentTypeName, fontSize = 14.sp)
                Text("Status: ${request.status}", fontSize = 12.sp, color = Color.Gray)
            }
            Button(onClick = { showDialog = true }) {
                Text("Status")
            }
        }
    }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Update Status") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    val statuses = listOf("Pending", "Processing", "Approved", "Ready for Download", "Rejected")
                    statuses.forEach { status ->
                        Button(
                            onClick = { 
                                onUpdateStatus(request.id, status)
                                showDialog = false 
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = if (request.status == status) ButtonDefaults.buttonColors() else ButtonDefaults.filledTonalButtonColors()
                        ) {
                            Text(status)
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showDialog = false }) { Text("Cancel") } }
        )
    }
}
