package ru.vsu.cs.petersocial.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ru.vsu.cs.petersocial.R
import ru.vsu.cs.petersocial.components.feed.FakeFeedComponent
import ru.vsu.cs.petersocial.components.feed.FeedComponent
import ru.vsu.cs.petersocial.ui.theme.KafifSocialTheme
import kotlin.random.Random
import kotlin.random.nextUInt

@Composable
fun KafeetCard(
    modifier: Modifier = Modifier,
    avatar: Painter,
    senderName: String,
    senderTag: String,
    dateString: String,
    text: String,
    likes: UInt
) {
    Spacer(modifier = Modifier.height(4.dp))
    Column {
        Row {
            Spacer(modifier = Modifier.width(4.dp))
            Image(
                painter = avatar,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(64.dp)
                    .padding(6.dp)
                    .aspectRatio(1f)
                    .clip(CircleShape)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.width(IntrinsicSize.Max)
            ) {
                Row {
                    Text(text = senderName, fontWeight = FontWeight.W600)
                    Spacer(modifier = Modifier.width(2.dp))
                    Text(text = "@$senderTag", fontWeight = FontWeight.W300)
                    Spacer(modifier = Modifier.width(2.dp))
                    Text(text = " • ", fontWeight = FontWeight.W300)
                    Text(text = dateString, fontWeight = FontWeight.W300)
                }
                Text(
                    text = text,
                    lineHeight = 18.sp
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.Outlined.FavoriteBorder, contentDescription = null)
                    Text(text = "$likes")
                }
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        HorizontalDivider(thickness = 1.dp)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen(component: FeedComponent) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(text = stringResource(id = R.string.app_name))
                }
            )
        }
    ) { contentPadding ->
        val random = remember {
            Random(1337)
        }
        LazyColumn(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.background)
                .fillMaxSize()
                .padding(contentPadding)
        ) {
            item {
                KafeetCard(
                    avatar = painterResource(id = R.drawable.peter),
                    senderName = "Пётр I",
                    senderTag = "peter_the_great",
                    dateString = "6 ч.",
                    text = "Сегодня заложил основание новой крепости у устья Невы. Будущий Санкт-Петербург станет нашим окном в Европу! #НоваяСтолица #ПрорубилОкно",
                    likes = random.nextUInt(800u, 1500u)
                )
            }

            item {
                KafeetCard(
                    avatar = painterResource(id = R.drawable.peter),
                    senderName = "Пётр I",
                    senderTag = "peter_the_great",
                    dateString = "1 дн",
                    text = "Сегодня подписал указ о брадобритии. Боярам теперь придётся расстаться с бородами или платить налог! Пора соответствовать европейским стандартам. #БородыДолой #ЕвропейскийСтиль",
                    likes = random.nextUInt(650u, 900u)
                )
            }

            item {
                KafeetCard(
                    avatar = painterResource(id = R.drawable.peter),
                    senderName = "Пётр I",
                    senderTag = "peter_the_great",
                    dateString = "2 дн",
                    text = "Вернулся из Великого посольства в Европу. Привёз множество мастеров и инженеров. Начинаем реформы! Россия станет передовой державой. #ВеликоеПосольство #Реформы",
                    likes = random.nextUInt(900u, 1200u)
                )
            }

            item {
                KafeetCard(
                    avatar = painterResource(id = R.drawable.peter),
                    senderName = "Пётр I",
                    senderTag = "peter_the_great",
                    dateString = "3 дн",
                    text = "Полтавская битва! Наконец-то показали шведам, кто здесь настоящая северная держава. Карл XII бежит в Османскую империю. Как говорится, дался нам урок под Полтавой шведам хорошо... #Полтава1709 #ШахИМат",
                    likes = random.nextUInt(1500u, 2500u)
                )
            }

            item {
                KafeetCard(
                    avatar = painterResource(id = R.drawable.peter),
                    senderName = "Пётр I",
                    senderTag = "peter_the_great",
                    dateString = "5 дн",
                    text = "Заложил первый камень Адмиралтейства. Здесь будут строить лучшие корабли для нашего флота! Без сильного флота нет сильной державы. #РоссийскийФлот #Адмиралтейство",
                    likes = random.nextUInt(700u, 1100u)
                )
            }

            item {
                KafeetCard(
                    avatar = painterResource(id = R.drawable.peter),
                    senderName = "Пётр I",
                    senderTag = "peter_the_great",
                    dateString = "6 дн",
                    text = "Подписал указ о создании Кунсткамеры. Теперь у нас будет первый музей! Наука должна быть доступна для народа. Привожу свою коллекцию диковинок из Голландии. #Кунсткамера #НаукаВажна",
                    likes = random.nextUInt(550u, 800u)
                )
            }
        }
    }

}

@Preview
@Composable
private fun FeedScreenPreview() {
    KafifSocialTheme {
        FeedScreen(component = FakeFeedComponent)
    }
}