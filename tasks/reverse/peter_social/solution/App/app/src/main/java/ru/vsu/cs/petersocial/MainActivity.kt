package ru.vsu.cs.petersocial

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.GestureDetector
import android.view.MotionEvent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInteropFilter
import com.arkivanov.decompose.defaultComponentContext
import com.arkivanov.decompose.extensions.compose.jetpack.stack.Children
import com.arkivanov.decompose.extensions.compose.jetpack.stack.animation.fade
import com.arkivanov.decompose.extensions.compose.jetpack.stack.animation.stackAnimation
import ru.vsu.cs.petersocial.RootComponent.Child
import ru.vsu.cs.petersocial.screens.FeedScreen
import ru.vsu.cs.petersocial.screens.SecretScreen
import ru.vsu.cs.petersocial.ui.theme.KafifSocialTheme
import kotlin.math.abs

class MainActivity : ComponentActivity() {
    private lateinit var root: RootComponent
    
    // Secret activation sequence tracking
    private val secretTapSequence = mutableListOf<Long>()
    private val correctSequence = longArrayOf(500, 350, 750, 350, 500) // Morse code pattern
    private val tapThreshold = 1000L // Reset sequence if no tap for 1 second
    private val handler = Handler(Looper.getMainLooper())
    private val sequenceResetRunnable = Runnable { secretTapSequence.clear() }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        root = RootComponent(componentContext = defaultComponentContext())
        
        // Custom gesture detector for secret sequence
        val gestureDetector = GestureDetector(this, object : GestureDetector.SimpleOnGestureListener() {
            override fun onDown(e: MotionEvent): Boolean {
                return true
            }
            
            override fun onSingleTapUp(e: MotionEvent): Boolean {
                // Process tap as part of secret sequence
                handleSecretTap()
                return true
            }
        })
        
        setContent {
            KafifSocialTheme {
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInteropFilter { event ->
                            // Feed all touch events to the gesture detector
                            gestureDetector.onTouchEvent(event)
                            true
                        },
                    color = MaterialTheme.colorScheme.background
                ) {
                    Children(stack = root.stack, animation = stackAnimation(fade())) {
                        when (val child = it.instance) {
                            is Child.FeedChild -> FeedScreen(component = child.component)
                            is Child.SecretChild -> SecretScreen(component = child.component)
                        }
                    }
                    
                    // Clean up handler when leaving composition
                    DisposableEffect(Unit) {
                        onDispose {
                            handler.removeCallbacks(sequenceResetRunnable)
                        }
                    }
                }
            }
        }
    }
    
    private fun handleSecretTap() {
        val currentTime = System.currentTimeMillis()
        
        // If this is not the first tap, calculate time since last tap
        if (secretTapSequence.isNotEmpty()) {
            val timeSinceLastTap = currentTime - secretTapSequence.last()
            secretTapSequence.add(timeSinceLastTap)
        } else {
            // First tap, just add a placeholder
            secretTapSequence.add(0)
        }
        
        // Add current timestamp for next interval calculation
        secretTapSequence.add(currentTime)
        
        // Reset sequence timer
        handler.removeCallbacks(sequenceResetRunnable)
        handler.postDelayed(sequenceResetRunnable, tapThreshold)
        
        // Check if sequence matches
        checkSecretSequence()
    }
    
    private fun checkSecretSequence() {
        // Need at least 5 intervals (6 taps) to check
        if (secretTapSequence.size >= 10) {
            val intervals = mutableListOf<Long>()
            
            // Extract the timing intervals, skipping timestamps
            for (i in 1 until secretTapSequence.size step 2) {
                intervals.add(secretTapSequence[i])
            }
            
            // Need 5 intervals to match our pattern
            if (intervals.size >= 5) {
                val lastFiveIntervals = intervals.takeLast(5)
                
                // Check if the pattern matches with some tolerance
                var matches = true
                for (i in correctSequence.indices) {
                    val diff = abs(lastFiveIntervals[i] - correctSequence[i])
                    // Allow 25% tolerance
                    if (diff > correctSequence[i] * 0.25) {
                        matches = false
                        break
                    }
                }
                
                if (matches) {
                    // Secret sequence detected! Navigate to secret screen
                    Log.d("CTF_CHALLENGE", "Secret sequence activated!")
                    root.navigateToSecret()
                    secretTapSequence.clear()
                }
            }
        }
    }
}