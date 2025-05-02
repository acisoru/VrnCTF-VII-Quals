from z3 import *


def find_key(ciphertext, known_prefix):
    key = BitVec('key', 256)

    eq1 = (key * ciphertext[1]) ^ (key + ciphertext[0] * ord(known_prefix[0])) == ciphertext[2]
    eq2 = (key * ciphertext[2]) ^ (key + ciphertext[1] * ord(known_prefix[1])) == ciphertext[3]

    solver = Solver()
    solver.add(eq1, eq2, key >= 0, key < 2 ** 128)

    if solver.check() == sat:
        model = solver.model()
        return model[key].as_long()
    return None


def decrypt_message(ciphertext, key):
    mod = 2 ** 256
    A = ciphertext[:2]
    flag = ""

    for i in range(len(ciphertext) - 2):
        for char in range(32, 128):
            expected = ((key * A[i + 1]) ^ (key + A[i] * char)) % mod
            if expected == ciphertext[i + 2]:
                flag += chr(char)
                A.append(expected)
                break
        else:
            flag += "?"
    return flag


def main():
    known_prefix = 'vrnctf{'
    ciphertext = eval(open('../public/message.txt', 'r').read().strip())

    key = find_key(ciphertext, known_prefix)
    if key is None:
        print("Ключ не найден")
        return
    print(f"Найденный ключ: {key}")

    flag = decrypt_message(ciphertext, key)
    print(f"Расшифрованный флаг: {flag}")


if __name__ == "__main__":
    main()
