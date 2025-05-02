package ru.vsu.cs.petersocial.utils

/**
 * Simple encryption utility for CTF challenge
 * This uses a custom cipher implementation for educational purposes
 */
object SomeUtils {
    
    // XOR key for additional obfuscation
    private val XOR_KEY = intArrayOf(0x7A, 0x31, 0x4B, 0x6C, 0x3F, 0x2E, 0x10, 0x75)
    
    // Base offset for caesar-like cipher
    private const val BASE_OFFSET = 13
    
    /**
     * Custom encryption algorithm - combination of caesar cipher with XOR
     */
    fun encryptFlag(input: String): String {
        val result = StringBuilder()
        
        input.forEachIndexed { index, char ->
            val shifted = (char.code + BASE_OFFSET) % 256
            
            val xorKey = XOR_KEY[index % XOR_KEY.size]
            val encrypted = shifted xor xorKey
            
            // Convert to hex representation
            result.append(encrypted.toString(16).padStart(2, '0'))
        }
        
        return result.toString()
    }
    
    /**
     * Decryption function - reverse of encryption
     */
    fun decryptFlag(encoded: String): String {
        val result = StringBuilder()
        
        // Process hex pairs
        for (i in encoded.indices step 2) {
            if (i + 1 < encoded.length) {
                val hexPair = encoded.substring(i, i + 2)
                val value = hexPair.toInt(16)
                
                // Reverse XOR with rotating key
                val xorKey = XOR_KEY[(i/2) % XOR_KEY.size]
                val unshifted = value xor xorKey
                
                // Reverse caesar shift
                val originalChar = if (unshifted < BASE_OFFSET) {
                    (unshifted + 256 - BASE_OFFSET)
                } else {
                    (unshifted - BASE_OFFSET)
                }
                
                result.append(originalChar.toChar())
            }
        }
        
        return result.toString()
    }
    
    /**
     * Generates a verification code from a string input
     * Simple CRC-like algorithm
     */
    fun generateVerificationCode(input: String): Int {
        var checksum = 0x1337
        
        input.forEach { char ->
            checksum = ((checksum shl 5) + checksum) + char.code
        }
        
        return checksum and 0xFFFFFF
    }
}
