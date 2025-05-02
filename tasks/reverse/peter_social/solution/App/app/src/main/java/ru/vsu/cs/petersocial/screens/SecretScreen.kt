package ru.vsu.cs.petersocial.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arkivanov.decompose.ComponentContext
import ru.vsu.cs.petersocial.utils.SomeUtils

/**
 * Secret screen component - not directly accessible through normal navigation
 * Contains the flag for CTF challenge
 */
class SecretScreenComponent(
    componentContext: ComponentContext
) : ComponentContext by componentContext

@Composable
fun SecretScreen(component: SecretScreenComponent) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Добро пожаловать",
                style = MaterialTheme.typography.headlineMedium,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = "Это секретная страница",
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(64.dp))
            
            // Decoy flag components and real ones mixed together
            Components()
        }
    }
}

@Composable
private fun Components() {
    // Track which components have been clicked
    var clickCount by remember { mutableIntStateOf(0) }
    var showFlag by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            // Decoy component
            ColorCircle(
                color = Color.Red,
                onClick = { clickCount++ },
                modifier = Modifier.alpha(0.8f)
            )
            
            /*// Contains part 1 of flag
            FirstFlagPartComponent(
                onClick = { clickCount++ },
                modifier = Modifier.alpha(0.9f)
            )*/
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            /*// Contains part 2 of flag
            SecondFlagPartComponent(
                onClick = { clickCount++ },
                modifier = Modifier.alpha(0.7f)
            )*/
            
            // Decoy component
            ColorCircle(
                color = Color.Green,
                onClick = { clickCount++ },
                modifier = Modifier.alpha(0.8f)
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Contains part 3 of flag - nearly invisible component
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            /*ThirdFlagPartComponent(
                onClick = { clickCount++ },
                // Almost invisible - alpha is very low
                modifier = Modifier.alpha(0.05f)
            )*/
        }
        
        Spacer(modifier = Modifier.height(48.dp))
        
        // Only show button after all components clicked
        if (clickCount >= 5) {
            Button(onClick = { showFlag = true }) {
                Text("Объединить флаг")
            }
        }
        
        // Show complete flag when button clicked
        if (showFlag) {
            Spacer(modifier = Modifier.height(32.dp))
            BComponent()
        }
    }
}

@Composable
private fun ColorCircle(
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(80.dp)
            .background(color, CircleShape)
            .clickable(onClick = onClick)
    )
}

@Composable
private fun BComponent() {
    // When all parts are collected, this will be where the flag is assembled
            
    // Encrypted parts of the flag
    val part1 = "f94e301cbe5d98"  // vrnctf{
    val part2 = "0f0f3a1d7f557c4b01"  // h1dd3n_1n
    val part3 = "1641761642139035f0"  // _c0mp0s3}
    
    // The full flag will be: vrnctf{h1dd3n_1n_c0mp0s3}
    // But we won't decrypt it here - that's part of the challenge
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Congratulations!",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "You found all the flag components!",
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Encrypted Flag Components:",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(text = "Part 1: $part1")
            Text(text = "Part 2: $part2")
            Text(text = "Part 3: $part3")
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Verification code for confirmation
            Spacer(modifier = Modifier.height(16.dp))
            
            val completeFlag = "vrnctf{h1dd3n_1n_c0mp0s3}"
            val verificationCode = SomeUtils.generateVerificationCode(completeFlag)
            
            Text(
                text = "Verification code: $verificationCode",
                fontSize = 10.sp,
                color = Color.Gray
            )
        }
    }
}
