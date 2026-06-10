package com.bcc.adri.ui.screens

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
import com.bcc.adri.data.model.PendingRegistration

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PendingRegistrationsScreen(
    pendingRegs: List<PendingRegistration>,
    onApprove: (PendingRegistration) -> Unit,
    onBack: () -> Unit
) {
    var sortOrder by remember { mutableStateOf("Newest") }
    var showSortMenu by remember { mutableStateOf(false) }

    val sortedRegs = remember(pendingRegs, sortOrder) {
        when (sortOrder) {
            "Newest" -> pendingRegs.sortedByDescending { it.dateSubmitted }
            "Oldest" -> pendingRegs.sortedBy { it.dateSubmitted }
            "Name A-Z" -> pendingRegs.sortedBy { it.fullName }
            else -> pendingRegs
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pending Registrations") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back") }
                },
                actions = {
                    Box {
                        IconButton(onClick = { showSortMenu = true }) {
                            Icon(Icons.Default.List, contentDescription = "Sort")
                        }
                        DropdownMenu(
                            expanded = showSortMenu,
                            onDismissRequest = { showSortMenu = false }
                        ) {
                            listOf("Newest", "Oldest", "Name A-Z").forEach { option ->
                                DropdownMenuItem(
                                    text = { Text(option) },
                                    onClick = {
                                        sortOrder = option
                                        showSortMenu = false
                                    },
                                    trailingIcon = {
                                        if (sortOrder == option) Icon(Icons.Default.Check, null, modifier = Modifier.size(16.dp))
                                    }
                                )
                            }
                        }
                    }
                }
            )
        }
    ) { padding ->
        if (sortedRegs.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No pending registrations.")
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(sortedRegs) { reg ->
                    PendingRegItem(reg, onApprove)
                }
            }
        }
    }
}

@Composable
fun PendingRegItem(reg: PendingRegistration, onApprove: (PendingRegistration) -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(reg.fullName, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Text("Email: ${reg.email}", fontSize = 14.sp, color = Color.Gray)
            Text("Student ID: ${reg.studentId}", fontSize = 14.sp)
            Text("Course: ${reg.course} (${reg.yearLevel})", fontSize = 14.sp)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                OutlinedButton(
                    onClick = { /* Reject logic */ },
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.Red)
                ) {
                    Icon(Icons.Default.Close, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Reject")
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(onClick = { onApprove(reg) }) {
                    Icon(Icons.Default.Check, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Approve")
                }
            }
        }
    }
}
