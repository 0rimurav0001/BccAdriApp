package com.bcc.adri.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bcc.adri.data.model.PendingRegistration
import com.google.firebase.Timestamp

enum class RegistrationStep {
    IDENTITY, ACADEMIC, SECURITY, VERIFICATION
}

@Composable
fun RegistrationScreen(
    onBack: () -> Unit,
    onRegister: (PendingRegistration, String) -> Unit
) {
    var currentStep by remember { mutableStateOf(RegistrationStep.IDENTITY) }
    
    // Form State
    var fullName by remember { mutableStateOf("") }
    var dateOfBirth by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    
    var studentId by remember { mutableStateOf("") }
    var course by remember { mutableStateOf("") }
    var yearLevel by remember { mutableStateOf("") }
    
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    
    var phoneNumber by remember { mutableStateOf("") }

    val steps = listOf(
        StepInfo(RegistrationStep.IDENTITY, "IDENTITY", Icons.Default.Person),
        StepInfo(RegistrationStep.ACADEMIC, "ACADEMIC", Icons.Default.Book),
        StepInfo(RegistrationStep.SECURITY, "SECURITY", Icons.Default.Lock),
        StepInfo(RegistrationStep.VERIFICATION, "VERIFICATION", Icons.Default.VerifiedUser)
    )

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.LightGray) // Placeholder for logo
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Student Signup",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "STEP ${currentStep.ordinal + 1} OF 4",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.Gray,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.Gray)
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Step Indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                steps.forEachIndexed { index, step ->
                    StepItem(
                        icon = step.icon,
                        label = step.label,
                        isActive = currentStep.ordinal >= index,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            // Form Content with Animation
            Box(modifier = Modifier.weight(1f, fill = false)) {
                AnimatedContent(
                    targetState = currentStep,
                    transitionSpec = {
                        if (targetState.ordinal > initialState.ordinal) {
                            slideInHorizontally { it } + fadeIn() togetherWith
                                    slideOutHorizontally { -it } + fadeOut()
                        } else {
                            slideInHorizontally { -it } + fadeIn() togetherWith
                                    slideOutHorizontally { it } + fadeOut()
                        }.using(SizeTransform(clip = false))
                    }, label = "stepAnimation"
                ) { step ->
                    when (step) {
                        RegistrationStep.IDENTITY -> IdentityStep(
                            fullName = fullName,
                            onFullNameChange = { fullName = it },
                            dateOfBirth = dateOfBirth,
                            onDobChange = { dateOfBirth = it },
                            address = address,
                            onAddressChange = { address = it }
                        )
                        RegistrationStep.ACADEMIC -> AcademicStep(
                            studentId = studentId,
                            onStudentIdChange = { studentId = it },
                            course = course,
                            onCourseChange = { course = it },
                            yearLevel = yearLevel,
                            onYearLevelChange = { yearLevel = it }
                        )
                        RegistrationStep.SECURITY -> SecurityStep(
                            email = email,
                            onEmailChange = { email = it },
                            password = password,
                            onPasswordChange = { password = it },
                            confirmPassword = confirmPassword,
                            onConfirmPasswordChange = { confirmPassword = it }
                        )
                        RegistrationStep.VERIFICATION -> VerificationStep(
                            phoneNumber = phoneNumber,
                            onPhoneNumberChange = { phoneNumber = it }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Navigation Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (currentStep != RegistrationStep.IDENTITY) {
                    Button(
                        onClick = {
                            currentStep = RegistrationStep.values()[currentStep.ordinal - 1]
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFF3F4F6),
                            contentColor = Color.Gray
                        ),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.KeyboardArrowLeft, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Back", fontWeight = FontWeight.Black)
                    }
                }

                Button(
                    onClick = {
                        if (currentStep == RegistrationStep.VERIFICATION) {
                            val reg = PendingRegistration(
                                email = email,
                                fullName = fullName,
                                studentId = studentId,
                                course = course,
                                yearLevel = yearLevel,
                                phoneNumber = phoneNumber,
                                dateSubmitted = Timestamp.now()
                            )
                            onRegister(reg, password)
                        } else {
                            currentStep = RegistrationStep.values()[currentStep.ordinal + 1]
                        }
                    },
                    modifier = Modifier
                        .weight(if (currentStep == RegistrationStep.IDENTITY) 1f else 2f)
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isStepValid(currentStep, fullName, dateOfBirth, address, studentId, course, yearLevel, email, password, confirmPassword, phoneNumber))
                            MaterialTheme.colorScheme.primary else Color(0xFFE5E7EB)
                    ),
                    shape = RoundedCornerShape(16.dp),
                    enabled = isStepValid(currentStep, fullName, dateOfBirth, address, studentId, course, yearLevel, email, password, confirmPassword, phoneNumber)
                ) {
                    Text(
                        text = if (currentStep == RegistrationStep.VERIFICATION) "Submit Profile" else "Continue",
                        fontWeight = FontWeight.Black
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(
                        if (currentStep == RegistrationStep.VERIFICATION) Icons.Default.CheckCircle else Icons.AutoMirrored.Filled.KeyboardArrowRight,
                        contentDescription = null
                    )
                }
            }
        }
    }
}

data class StepInfo(val step: RegistrationStep, val label: String, val icon: ImageVector)

@Composable
fun StepItem(icon: ImageVector, label: String, isActive: Boolean, modifier: Modifier = Modifier) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(if (isActive) MaterialTheme.colorScheme.primary else Color(0xFFF9FAFB))
                .padding(10.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = if (isActive) Color.White else Color(0xFFD1D5DB)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = label,
            fontSize = 8.sp,
            fontWeight = FontWeight.Black,
            color = if (isActive) MaterialTheme.colorScheme.primary else Color(0xFFD1D5DB)
        )
    }
}

@Composable
fun IdentityStep(
    fullName: String, onFullNameChange: (String) -> Unit,
    dateOfBirth: String, onDobChange: (String) -> Unit,
    address: String, onAddressChange: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        FormField(
            label = "Full Name",
            value = fullName,
            onValueChange = onFullNameChange,
            placeholder = "Juan Dela Cruz",
            icon = Icons.Default.Person
        )
        FormField(
            label = "Date of Birth",
            value = dateOfBirth,
            onValueChange = onDobChange,
            placeholder = "MM/DD/YYYY",
            icon = Icons.Default.CalendarToday,
            isReadOnly = true // Would ideally use a date picker
        )
        FormField(
            label = "Complete Address",
            value = address,
            onValueChange = onAddressChange,
            placeholder = "Brgy. San Carlos, Basista, Pangasinan",
            icon = Icons.Default.LocationOn,
            isSingleLine = false
        )
    }
}

@Composable
fun AcademicStep(
    studentId: String, onStudentIdChange: (String) -> Unit,
    course: String, onCourseChange: (String) -> Unit,
    yearLevel: String, onYearLevelChange: (String) -> Unit
) {
    var showCourseDialog by remember { mutableStateOf(false) }
    var showYearDialog by remember { mutableStateOf(false) }

    val courses = listOf("Computer Science", "Information Technology", "Business Administration", "Hospitality Management", "Education", "Nursing")
    val years = listOf("1st Year", "2nd Year", "3rd Year", "4th Year")

    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        FormField(
            label = "Student ID Number",
            value = studentId,
            onValueChange = onStudentIdChange,
            placeholder = "2024-XXXXXX",
            icon = Icons.Default.Badge
        )
        
        DropdownField(
            label = "Course",
            value = course,
            placeholder = "Select Course",
            icon = Icons.Default.Book,
            onClick = { showCourseDialog = true }
        )

        DropdownField(
            label = "Year Level",
            value = yearLevel,
            placeholder = "Select Year Level",
            icon = Icons.AutoMirrored.Filled.TrendingUp,
            onClick = { showYearDialog = true }
        )
    }

    if (showCourseDialog) {
        SelectionDialog(title = "Select Course", options = courses, onSelect = { onCourseChange(it); showCourseDialog = false }, onDismiss = { showCourseDialog = false })
    }
    if (showYearDialog) {
        SelectionDialog(title = "Select Year Level", options = years, onSelect = { onYearLevelChange(it); showYearDialog = false }, onDismiss = { showYearDialog = false })
    }
}

@Composable
fun SecurityStep(
    email: String, onEmailChange: (String) -> Unit,
    password: String, onPasswordChange: (String) -> Unit,
    confirmPassword: String, onConfirmPasswordChange: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        FormField(
            label = "Email Address",
            value = email,
            onValueChange = onEmailChange,
            placeholder = "your.email@gmail.com",
            icon = Icons.Default.Email
        )
        FormField(
            label = "Create Password",
            value = password,
            onValueChange = onPasswordChange,
            placeholder = "••••••••",
            icon = Icons.Default.Lock,
            isPassword = true
        )
        FormField(
            label = "Confirm Password",
            value = confirmPassword,
            onValueChange = onConfirmPasswordChange,
            placeholder = "••••••••",
            icon = Icons.Default.Lock,
            isPassword = true
        )
    }
}

@Composable
fun VerificationStep(
    phoneNumber: String, onPhoneNumberChange: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        FormField(
            label = "Phone Number",
            value = phoneNumber,
            onValueChange = onPhoneNumberChange,
            placeholder = "09XXXXXXXXX",
            icon = Icons.Default.Phone
        )

        // ID Upload Placeholder
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
                .clip(RoundedCornerShape(32.dp))
                .background(Color(0xFFF0FDF4))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White)
                        .padding(12.dp)
                ) {
                    Icon(Icons.Default.Image, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text("UPLOAD SCHOOL ID", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color(0xFF166534))
                Text(
                    "Please upload a clear photo of your current School ID for verification.",
                    fontSize = 10.sp,
                    color = Color(0xFF16A34A),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { /* File picker logic */ },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color(0xFF16A34A)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.height(36.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp)
                ) {
                    Text("CHOOSE FILE", fontSize = 10.sp, fontWeight = FontWeight.Black)
                }
            }
        }

        // Warning Box
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFFFFFBEB))
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = Color(0xFFD97706), modifier = Modifier.size(20.dp))
            Text(
                "By submitting, you certify that all information is true and correct. Misrepresentation is grounds for account suspension.",
                fontSize = 10.sp,
                color = Color(0xFFB45309),
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun FormField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    icon: ImageVector,
    isPassword: Boolean = false,
    isSingleLine: Boolean = true,
    isReadOnly: Boolean = false
) {
    Column {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(start = 4.dp, bottom = 8.dp)) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = label, fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color(0xFF374151))
        }
        TextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, fontWeight = FontWeight.Bold, color = Color.LightGray) },
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp)),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFFF9FAFB),
                unfocusedContainerColor = Color(0xFFF9FAFB),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = MaterialTheme.colorScheme.primary
            ),
            visualTransformation = if (isPassword) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
            singleLine = isSingleLine,
            readOnly = isReadOnly,
            textStyle = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold)
        )
    }
}

@Composable
fun DropdownField(
    label: String,
    value: String,
    placeholder: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Column(modifier = Modifier.clickable { onClick() }) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(start = 4.dp, bottom = 8.dp)) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = label, fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color(0xFF374151))
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFFF9FAFB))
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = if (value.isEmpty()) placeholder else value,
                fontWeight = FontWeight.Bold,
                color = if (value.isEmpty()) Color.LightGray else Color.Black
            )
            Icon(Icons.Default.KeyboardArrowDown, contentDescription = null, tint = Color.Gray)
        }
    }
}

@Composable
fun SelectionDialog(title: String, options: List<String>, onSelect: (String) -> Unit, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title, fontWeight = FontWeight.Black) },
        text = {
            Column {
                options.forEach { option ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelect(option) }
                            .padding(vertical = 12.dp, horizontal = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(option, fontWeight = FontWeight.Bold)
                        RadioButton(selected = false, onClick = { onSelect(option) })
                    }
                }
            }
        },
        confirmButton = {},
        shape = RoundedCornerShape(24.dp)
    )
}

private fun isStepValid(
    step: RegistrationStep,
    fullName: String, dob: String, address: String,
    studentId: String, course: String, year: String,
    email: String, pass: String, confirm: String,
    phone: String
): Boolean {
    return when (step) {
        RegistrationStep.IDENTITY -> fullName.isNotBlank() && dob.isNotBlank() && address.isNotBlank()
        RegistrationStep.ACADEMIC -> studentId.isNotBlank() && course.isNotBlank() && year.isNotBlank()
        RegistrationStep.SECURITY -> email.isNotBlank() && pass.length >= 6 && pass == confirm
        RegistrationStep.VERIFICATION -> phone.isNotBlank()
    }
}
