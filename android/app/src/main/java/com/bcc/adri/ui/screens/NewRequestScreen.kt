package com.bcc.adri.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bcc.adri.data.model.DocumentRequest
import com.google.firebase.Timestamp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewRequestScreen(
    onBack: () -> Unit,
    onSubmit: (DocumentRequest) -> Unit
) {
    var selectedDocType by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var expanded by remember { mutableStateOf(false) }

    val documentTypes = listOf(
        "Official Transcript of Records" to 150.0,
        "Certificate of Enrollment" to 50.0,
        "Diploma Replacement" to 500.0,
        "Good Moral Certificate" to 75.0,
        "Honorable Dismissal" to 100.0
    )

    val currentFee = documentTypes.find { it.first == selectedDocType }?.second ?: 0.0

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New Document Request") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                "Select Document",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Gray
            )
            
            Spacer(modifier = Modifier.height(8.dp))

            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = !expanded },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = selectedDocType,
                    onValueChange = {},
                    readOnly = true,
                    placeholder = { Text("Choose a document type") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors()
                )

                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    documentTypes.forEach { (name, fee) ->
                        DropdownMenuItem(
                            text = { 
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(name)
                                    Text("₱$fee", color = Color.Gray)
                                }
                            },
                            onClick = {
                                selectedDocType = name
                                expanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                "Additional Notes / Purpose",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Gray
            )
            
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                modifier = Modifier.fillMaxWidth().height(120.dp),
                placeholder = { Text("e.g. For employment, for transfer...") }
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Fee Summary
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Total Fee:", fontWeight = FontWeight.Bold)
                    Text("₱${String.format("%.2f", currentFee)}", fontWeight = FontWeight.Black, fontSize = 18.sp)
                }
            }

            Spacer(modifier = Modifier.height(48.dp))

            Button(
                onClick = {
                    if (selectedDocType.isNotEmpty()) {
                        onSubmit(
                            DocumentRequest(
                                documentTypeName = selectedDocType,
                                fee = currentFee,
                                notes = notes,
                                status = "Pending",
                                dateSubmitted = Timestamp.now()
                            )
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                enabled = selectedDocType.isNotEmpty(),
                shape = MaterialTheme.shapes.medium
            ) {
                Text("Submit Request", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
