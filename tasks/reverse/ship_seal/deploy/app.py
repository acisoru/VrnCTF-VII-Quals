from flask import Flask, render_template_string, request
from datetime import datetime

app = Flask(__name__)

FLAG = "vrnctf{th3_v3rdIct_is_n0t_4_s0urc3_0f_truth}"

SECRET_SALT = 0x1337C0DE

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Корабѣльныя канцѣлярiя Пѣтра I</title>
    <style>
        body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 0 auto; 
               padding: 20px; background: #f9f2e6; color: #333; }
        .container { background: #fff; padding: 25px; border: 1px solid #d4a76a; 
                    border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #8b4513; text-align: center; }
        label { display: block; margin-top: 15px; font-weight: bold; }
        input { width: 100%; padding: 8px; margin: 5px 0 15px; 
                border: 1px solid #d4a76a; border-radius: 3px; }
        button { background: #8b4513; color: white; padding: 10px 15px; 
                 border: none; border-radius: 3px; cursor: pointer; }
        .result { margin-top: 20px; padding: 15px; border-radius: 3px; }
        .success { background: #e6f7e6; border: 1px solid #2e8b57; color: #2e8b57; }
        .error { background: #ffebee; border: 1px solid #c62828; color: #c62828; }
        .warning { background: #fff8e1; border: 1px solid #ff8f00; color: #ff8f00; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Корабѣльныя канцѣлярiя Пѣтра I</h1>
        <form method="POST">
            <label for="master_name">Имя корабѣльнаго мастѣра:</label>
            <input type="text" id="master_name" name="master_name" required>
            
            <label for="ship_name">Названiя корабля:</label>
            <input type="text" id="ship_name" name="ship_name" required>
            
            <label for="permit">Разрѣшенiя от Пѣтра I:</label>
            <input type="text" id="permit" name="permit" placeholder="Ввѣдитѣ дарованную грамоту" required>
            
            <button type="submit">Провѣрiть разрѣшенiя</button>
        </form>
        
        {% if message %}
            <div class="result {{ message_class }}">{{ message|safe }}</div>
        {% endif %}
    </div>
</body>
</html>
"""

def transform_name(name):
    """Обфусцированное преобразование имени в хеш"""
    hash_val = 0x55AA55AA
    for i, char in enumerate(name):
        if i % 3 == 0:
            hash_val ^= (ord(char) << 8)
        elif i % 3 == 1:
            hash_val += ord(char) * 0x1337
        else:
            hash_val = (hash_val >> 3) | (hash_val << 29) & 0xFFFFFFFF
    
    for _ in range(10):
        if hash_val == 0xDEADBEEF:
            hash_val ^= 0x12345678
    
    return hash_val ^ SECRET_SALT


def generate_seal(master, ship):
    """Генерация печати на основе имени мастера и корабля"""
    master_hash = transform_name(master)
    ship_hash = transform_name(ship)
    combined = (master_hash ^ ship_hash) & 0xFFFF
    
    now = datetime.now()
    day_month = now.day * 100 + now.month
    
    final = (combined << 16) | day_month
    
    return f"{final:08X}"


def validate_seal(master, ship, seal):
    """Проверка валидности печати"""
    expected_seal = generate_seal(master, ship)
    return seal.upper() == expected_seal


@app.route('/', methods=['GET', 'POST'])
def keygen():
    message = ""
    message_class = ""
    
    if request.method == 'POST':
        master_name = request.form.get('master_name', '').strip()
        ship_name = request.form.get('ship_name', '').strip()
        permit = request.form.get('permit', '').strip().upper()
        
        if not master_name or not ship_name or not permit:
            message = "Всѣ поля должнъ быть заполнѣнъ!"
            message_class = "error"
        else:
            if validate_seal(master_name, ship_name, permit):
                message = f"Разрѣшенiя подтвѣрждѣно!<br>Флагъ: {FLAG}"
                message_class = "success"
            else:
                message = f"Нѣвѣрное разрѣшенiя!"
                message_class = "error"

    return render_template_string(HTML_TEMPLATE, message=message, message_class=message_class)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)