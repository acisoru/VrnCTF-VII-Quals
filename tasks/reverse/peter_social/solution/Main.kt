fun main() {
    val parts = listOf(
        "f94e301cbe5d98",
        "0f0f3a1d7f557c4b01",
        "1641761642139035f0"
    )
    parts.joinToString("") { decryptFlag(it) }.apply{
        println(this)
    }
}

private const val BASE_OFFSET = 13

private val XOR_KEY = intArrayOf(122, 49, 75, 108, 63, 46, 16, 117)

fun decryptFlag(encoded: String): String {
    var originalChar: Int
    val result = StringBuilder()
    var i = 0
    val progressionLastElement: Int = IntProgression.fromClosedRange(0, encoded.length - 1, 2).last
    if (0 <= progressionLastElement) {
        while (true) {
            if (i + 1 < encoded.length) {
                val hexPair = encoded.substring(i, i + 2)
                val value = hexPair.toInt(16)
                val xorKey: Int = XOR_KEY[(i / 2) % XOR_KEY.size]
                val unshifted = value xor xorKey
                originalChar = if (unshifted < 13) {
                    (unshifted + 256) - 13
                } else {
                    unshifted - BASE_OFFSET
                }
                result.append(originalChar.toChar())
            }
            if (i == progressionLastElement) {
                break
            }
            i += 2
        }
    }
    return result.toString()
}
