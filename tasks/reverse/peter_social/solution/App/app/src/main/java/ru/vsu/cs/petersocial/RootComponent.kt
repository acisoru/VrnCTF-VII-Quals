package ru.vsu.cs.petersocial

import com.arkivanov.decompose.ComponentContext
import com.arkivanov.decompose.router.stack.ChildStack
import com.arkivanov.decompose.router.stack.StackNavigation
import com.arkivanov.decompose.router.stack.childStack
import com.arkivanov.decompose.router.stack.push
import com.arkivanov.decompose.value.Value
import kotlinx.serialization.Serializable
import ru.vsu.cs.petersocial.components.feed.FeedComponent
import ru.vsu.cs.petersocial.components.feed.RealFeedComponent
import ru.vsu.cs.petersocial.screens.SecretScreenComponent

class RootComponent(
    componentContext: ComponentContext
) : ComponentContext by componentContext {
    private val navigation = StackNavigation<Config>()

    val stack: Value<ChildStack<*, Child>> =
        childStack(
            source = navigation,
            serializer = Config.serializer(),
            initialConfiguration = Config.Feed,
            handleBackButton = true,
            childFactory = ::child,
        )

    private fun child(
        config: Config,
        componentContext: ComponentContext
    ): Child {
        return when (config) {
            Config.Feed -> Child.FeedChild(component = RealFeedComponent(componentContext))
            Config.Secret -> Child.SecretChild(component = SecretScreenComponent(componentContext))
        }
    }
    
    // Method to navigate to secret screen - needs special activation sequence
    fun navigateToSecret() {
        navigation.push(Config.Secret)
    }

    sealed class Child {
        class FeedChild(val component: FeedComponent): Child()
        class SecretChild(val component: SecretScreenComponent): Child()
    }

    @Serializable
    sealed interface Config {
        @Serializable
        data object Feed : Config
        
        @Serializable
        data object Secret : Config
    }
}