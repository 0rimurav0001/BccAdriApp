package com.bcc.adri.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.List
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.bcc.adri.data.model.DocumentRequest

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportsScreen(
    title: String,
    requests: List<DocumentRequest>,
    onUpdateStatus: (String, String) -> Unit,
    onBack: () -> Unit
) {
    var sortOrder by remember { mutableStateOf("Newest") }
    var showSortMenu by remember { mutableStateOf(false) }

    val sortedRequests = remember(requests, sortOrder) {
        when (sortOrder) {
            "Newest" -> requests.sortedByDescending { it.dateSubmitted }
            "Oldest" -> requests.sortedBy { it.dateSubmitted }
            "Name A-Z" -> requests.sortedBy { it.requesterName }
            "Fee High-Low" -> requests.sortedByDescending { it.fee }
            else -> requests
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
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
                            listOf("Newest", "Oldest", "Name A-Z", "Fee High-Low").forEach { option ->
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
        if (sortedRequests.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No data for this report.")
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(sortedRequests) { request ->
                    AdminRequestItem(request, onUpdateStatus)
                }
            }
        }
    }
}
