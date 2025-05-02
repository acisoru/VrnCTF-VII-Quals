#include <cstdint>
#include <cstddef>
#include <cstring>
#include <cstdio>
#include <string>
#include <cmath>

struct OpaqueState {
    uint64_t s[4];
    int phase;
    uint8_t counter;
    uint64_t shadow[3];
};

static inline uint64_t opaque(uint64_t v, uint64_t key) {
    uint64_t k = (key ^ (v >> 27)) | 1;
    v = ((v ^ 0x9E3779B97F4A7C15ULL) + k) * (v | (k << 48));
    v = (v ^ (v >> 37)) * 0x9E6C89F1872B0C5AULL;
    if ((k ^ v) & 1) {
        v = (v << 31) ^ (v >> 11) ^ (k * 0xDEADBEEFCAFEBABEULL);
    } else {
        v = ((v + 0x6A09E667F3BCC908ULL) ^ k) * (v - 0xBB67AE8584CAA73BULL);
    }
    return v + (v >> 12);
}

static uint8_t tbl_enc[128];
static volatile bool tbl_init = false;
__attribute__((constructor)) static void real_init() {
    const uint8_t secret_tbl[128] = {
        0x52,0x34,0x16,0x78,0x9A,0xBC,0xDE,0xF0,0x68,0x2A,0x3C,0x4E,0x50,0x62,0x74,0x16,
        0x98,0xAA,0xB7,0xCE,0xDF,0x61,0xF3,0x05,0x17,0x29,0x3B,0x4D,0x5F,0x61,0x73,0x85,
        0x97,0x49,0xBB,0xCD,0xEF,0x01,0x13,0x25,0x37,0x49,0x5B,0x6D,0x7F,0x81,0x93,0xA5,
        0xB7,0xC9,0xDB,0xED,0xFF,0x11,0x23,0x35,0x47,0x59,0x6B,0x7D,0x8F,0xA1,0xB3,0xC5,
        0xD7,0xE9,0xFB,0x0D,0x1F,0x31,0x43,0x55,0x67,0x79,0x8B,0x9D,0xAF,0xC1,0xD3,0xE5,
        0xF7,0x09,0x1B,0x2D,0x3F,0x51,0x63,0x75,0x87,0x99,0xAB,0xBD,0xCF,0xE1,0xF3,0x05,
        0x17,0x29,0x3B,0x4D,0x5F,0x71,0x83,0x95,0xA7,0xB9,0xCB,0xDD,0xEF,0x01,0x13,0x25
    };
    memcpy(tbl_enc, secret_tbl, 128);
}

static OpaqueState prepare_state(std::string const& data) {
    OpaqueState st{};
    size_t len = data.size();
    st.s[0] = opaque(0x123456789ABCDEF0ULL ^ len, 0x0FEDCBA987654321ULL);
    st.s[1] = opaque(st.s[0] ^ 0x5555AAAA5555AAAAULL, opaque(len, 0x1234));
    st.s[2] = opaque(len ? data[0] : 0xAA, st.s[1] >> 32);
    st.s[3] = st.s[0] ^ st.s[1] ^ st.s[2];
    for (size_t i = 0; i < len; ++i) {
        uint8_t b = data[i] ^ (opaque(i, 0x1234) & 0xFF);
        uint64_t mix = opaque(b, i << 16);
        for (int j = 0; j < 3; ++j) {
            st.s[j] = opaque(st.s[j], mix + j) ^ (st.s[(j + 1) % 3] >> 16);
            st.s[j] = (st.s[j] << 32) | (st.s[j] >> 32);
        }
    }
    st.phase = 1;
    return st;
}

static char generate_char(OpaqueState& st, int idx) {
    if (st.phase != 1) return 0;
    uint64_t t = (st.s[0] * ~st.s[1]) ^ (st.s[2] + idx);
    t = opaque(t, opaque(idx, 0x1234) << 32);
    uint32_t acc = (t >> 16) & 0x3FF;
    uint32_t char_idx = (acc * 0x1234) % 62;
    char c = (char_idx < 10) ? '0' + char_idx : 
             (char_idx < 36) ? 'A' + (char_idx - 10) : 
                               'a' + (char_idx - 36);
    st.s[0] ^= (c << 16) | (idx << 8);
    st.s[1] += opaque(c, idx) % 0x1000;
    st.s[2] = (st.s[2] << 12) ^ (st.s[1] + c);
    return c;
}

static uint32_t map_back(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'A' && c <= 'Z') return 10 + (c - 'A');
    if (c >= 'a' && c <= 'z') return 36 + (c - 'a');
    return 0;
}

static int check_remaining_password(OpaqueState& st, std::string const& pass) {
    if (st.phase != 1) return 0;
    st.phase = 2;

    uint64_t state1 = st.s[0];
    uint64_t state2 = st.s[1];
    uint64_t state3 = st.s[2];
    uint64_t accum = 0;

    for (int i = 5; i < 20; ++i) {
        char c = pass[i];
        uint64_t t = opaque(state1 ^ i, state2);
        t = opaque(t, state3);
        uint32_t expected_idx = (t & 0xFFFF) % 62;
        uint32_t provided_idx = map_back(c);
        uint64_t diff = (provided_idx - expected_idx) & 0x3F;
        accum = opaque(accum, diff ^ i);
    }

    uint64_t expected_accum = 0;
    for (int i = 5; i < 20; ++i) {
        expected_accum = opaque(expected_accum, i);
    }

    return (accum == expected_accum);
}

int check_sign(std::string const& data, std::string const& pass) {
    OpaqueState st = prepare_state(data);
    for (int i = 0; i < 5; ++i) {
        char c = generate_char(st, i);
        if (c != pass[i]) {
            return 0;
        }
    }
    return check_remaining_password(st, pass);
}

// std::string generate_pass(std::string const& name) {
//     OpaqueState st = prepare_state(name);
//     std::string pass;
//     pass.reserve(20);

//     for (int i = 0; i < 5; ++i) {
//         pass.push_back(generate_char(st, i));
//     }

//     uint64_t state1 = st.s[0];
//     uint64_t state2 = st.s[1];
//     uint64_t state3 = st.s[2];
//     for (int i = 5; i < 20; ++i) {
//         uint64_t t = opaque(state1 ^ i, state2);
//         t = opaque(t, state3);
//         uint32_t idx = (t & 0xFFFF) % 62;
//         char c = (idx < 10) ? '0' + idx : 
//                  (idx < 36) ? 'A' + (idx - 10) : 
//                               'a' + (idx - 36);
//         pass.push_back(c);
//     }
//     return pass;
// }

static constexpr char BASE32_ALPHABET[33] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

std::string generate_otp(std::string const& name, std::string const& sign) {
    int is_sign_valid = check_sign(name, sign);
    if (!is_sign_valid) {
        return "invalid sign";
    }
    std::string buf = name + sign.substr(0, 5);
    OpaqueState st = prepare_state(buf);
    std::string token;
    token.reserve(32);
    for (int i = 0; i < 32; ++i) {
        token.push_back(BASE32_ALPHABET[generate_char(st, i) % 32]);
    }
    return token;
}

extern "C" {
    //char* generate_pass_c(const char* name_ptr) {
    //    std::string name(name_ptr);
    //    std::string result = generate_pass(name);
    //    char* buf = (char*)std::malloc(result.size() + 1);
    //    std::memcpy(buf, result.c_str(), result.size() + 1);
    //    return buf;
    //}
    
    char* generate_otp_c(const char* name_ptr, const char* sign_ptr) {
        std::string name(name_ptr);
        std::string sign(sign_ptr);
        std::string result = generate_otp(name, sign);
        char* buf = (char*)std::malloc(result.size() + 1);
        std::memcpy(buf, result.c_str(), result.size() + 1);
        return buf;
    }

    double verst_to_sazhen_c(double verst) {
        double result = verst * 500.0;
        return std::round(result * 100.0) / 100.0;
    }

    double sazhen_to_verst_c(double sazhen) {
        double result = sazhen / 500.0;
        return std::round(result * 100.0) / 100.0;
    }

    double arshin_to_vershok_c(double arshin) {
        double result = arshin * 16.0;
        return std::round(result * 100.0) / 100.0;
    }

    double vershok_to_arshin_c(double vershok) {
        double result = vershok / 16.0;
        return std::round(result * 100.0) / 100.0;
    }

    double travel_time_hours_c(double distance_sazhen, double speed_sazhen_per_hour) {
        if (speed_sazhen_per_hour == 0.0) return 0.0;
        double hours = distance_sazhen / speed_sazhen_per_hour;
        return std::round(hours * 100.0) / 100.0;
    }

    double calc_speed_sazhen_per_hour_c(double distance_sazhen, double time_hours) {
        if (time_hours == 0.0) return 0.0;
        double rate = distance_sazhen / time_hours;
        return std::round(rate * 100.0) / 100.0;
    }

    double calc_distance_sazhen_c(double speed_sazhen_per_hour, double time_hours) {
        double distance = speed_sazhen_per_hour * time_hours;
        return std::round(distance * 100.0) / 100.0;
    }
}