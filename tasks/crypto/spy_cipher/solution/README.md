# Решение

Для каждого символа флага sᵢ (ASCII-код) вычисляется новый элемент:
```math
a_{i+2} = \left( k \cdot a_{i+1} \oplus \left( k + a_i \cdot s_i \right) \right) \mod 2^{256}
```


Зная, что флаги всегда начинаются с ```vrnctf{```, а элементы a<sub>i</sub> содержаться в message.txt(
a<sub>0</sub> = 7,
a<sub>1</sub> = 97,
a<sub>2</sub> = 225013...,
a<sub>3</sub> = 517253...)

Получаем два уравнения для a<sub>2</sub> и a<sub>3</sub>:


```math
\begin{cases}
225013... = \left( k \cdot 97 \oplus \left( k + 7 \cdot ord('v') \right) \right) \mod 2^{256}, \\
517253... = \left( k \cdot 225013... \oplus \left( k + 97 \cdot ord('r') \right) \right) \mod 2^{256}.
\end{cases}
```

Для решения системы уравнений, можно воспользоваться SMT-солвером [Z3](https://pypi.org/project/z3-solver/).

После нахождения ```k``` посимвольно восстанавливаем флаг

[Решение на python](sploit.py)