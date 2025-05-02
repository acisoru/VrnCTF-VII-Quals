package ru.vsu.cs.petersocial.components.feed

import com.arkivanov.decompose.ComponentContext

class RealFeedComponent(
    componentContext: ComponentContext
): FeedComponent, ComponentContext by componentContext