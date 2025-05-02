package ru.vsu.cs.petersocial.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80,
    background = Color.Black
)

@Immutable
data class ExtendedColors(
    val buttonBackground: Color,
    val buttonText: Color,
    val primary: Color,
    val secondary: Color
)

val LocalExtendedColors = staticCompositionLocalOf {
    ExtendedColors(
        buttonBackground = Color.Unspecified,
        buttonText = Color.Unspecified,
        primary = Color.Unspecified,
        secondary = Color.Unspecified
    )
}

val extendedColorsDark = ExtendedColors(
    buttonBackground = Color(0xFFFFFFFF),
    buttonText = Color(0xFF000000),
    primary = Color(0xFFFFFFFF),
    secondary = Color(0xFF000000)
)

@Composable
fun KafifSocialTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme
    val extendedColorsThemed = extendedColorsDark
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }
    CompositionLocalProvider(LocalExtendedColors provides extendedColorsThemed) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}

@Suppress("unused")
object ExtendedTheme {
    val colors: ExtendedColors
        @Composable
        get() = LocalExtendedColors.current
}