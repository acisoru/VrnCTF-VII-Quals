import random
from secrets import flag

m = 2 ** 256


def e(k, ms):
    a = [7, 97]
    for i, s in enumerate(map(ord, ms)):
        a.append(((k * a[i + 1]) ^ (k + (a[i] * s))) % m)
    return a


k = random.randrange(2 ** 128)
c = e(k, flag)
print(c)