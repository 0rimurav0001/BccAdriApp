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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bcc.adri.data.model.User

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserManagementScreen(
    users: List<User>,
    onToggleStatus: (String, String) -> Unit,
    onBack: () -> Unit
) {
    var sortOrder by remember { mutableStateOf("Name A-Z") }
    var showSortMenu by remember { mutableStateOf(false) }

    val sortedUsers = remember(users, sortOrder) {
        when (sortOrder) {
            "Name A-Z" -> users.sortedBy { it.fullName }
            "Name Z-A" -> users.sortedByDescending { it.fullName }
            "Role" -> users.sortedBy { it.role }
            "Status" -> users.sortedBy { it.status }
            else -> users
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Account Management") },
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
                            listOf("Name A-Z", "Name Z-A", "Role", "Status").forEach { option ->
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
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(sortedUsers) { user ->
                UserAccountItem(user, onToggleStatus)
            }
        }
    }
}

@Composable
fun UserAccountItem(user: User, onToggleStatus: (String, String) -> Unit) {
    val isActive = user.status == "active"
    
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(user.fullName, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold, fontSize = 16.sp)
                Text(user.email, fontSize = 14.sp, color = Color.Gray)
                Text("Role: ${user.role.uppercase()} | Status: ${user.status.uppercase()}", fontSize = 12.sp, 
                    color = if (isActive) Color(0xFF4CAF50) else Color.Red)
            }
            
            Button(
                onClick = { onToggleStatus(user.uid, user.status) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isActive) Color.Red else Color(0xFF4CAF50)
                )
            ) {
                Icon(if (isActive) Icons.Default.Lock else Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(if (isActive) "Disable" else "Enable")
            }
        }
    }
}
