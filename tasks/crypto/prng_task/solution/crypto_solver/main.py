#!/usr/bin/python3

import re
import struct

import z3
import numpy as np

sequence = list(
    map(
        lambda x: int(re.search(r"\d+", string=x).group()),
        open("res/words.txt", "r+").readlines()
    )
)

solver = z3.Solver()
x0, x1, x2, x3, x4 = z3.BitVecs("x0 x1 x2 x3 x4", 32)
counter = z3.BitVec("counter", 32)

for i in range(len(sequence)):
    t = x4
    s = x0
    x4 = x3
    x3 = x2
    x2 = x1
    x1 = s
    t ^= z3.LShR(t, 2)
    t ^= t << 1
    t ^= s ^ (s << 4)
    x0 = t
    counter += 362437

    solver.add(sequence[i] == t + counter)
if solver.check() != z3.sat:
    exit(1)
model = solver.model()
states = {}
for state in model.decls():
    states[state.__str__()] = model[state]

x0 = np.uint32(states["x0"].as_long())
x1 = np.uint32(states["x1"].as_long())
x2 = np.uint32(states["x2"].as_long())
x3 = np.uint32(states["x3"].as_long())
x4 = np.uint32(states["x4"].as_long())
counter = 0


def calculate_randoms(times: int) -> list[int]:
    global x0, x1, x2, x3, x4, counter
    result: list[int] = []
    for _ in range(times):
        t = x4
        s = x0
        x4 = x3
        x3 = x2
        x2 = x1
        x1 = s
        t ^= np.right_shift(np.uint32(t), 2)
        t ^= t << 1
        t ^= s ^ (s << 4)
        x0 = t
        counter += 362437
        result.append(t + counter)
    return np.uint32(result)


encrypted_data: bytes = open("res/encrypted.bin", 'rb').read()
while len(encrypted_data) % 8 != 0:
    encrypted_data += b"\x00"
numbers = list(map(lambda x: x[0], list(struct.iter_unpack("<Q", encrypted_data))))
needed_randoms = calculate_randoms(len(numbers) * 2)
bytes_for_string = []
for i in range(len(numbers)):
    random_1, random_2 = needed_randoms[i * 2], needed_randoms[i * 2 + 1]
    random = np.uint32([random_1, random_2]).view(np.uint64)[0]
    output_number = np.uint64([numbers[i]])
    input_number = output_number ^ random
    input_number_arr: np.ndarray[np.uint8] = np.uint64([input_number]).view(np.uint8)
    bytes_for_string.extend(*input_number_arr.tolist())

print(bytes(bytes_for_string).decode('utf-8'))
