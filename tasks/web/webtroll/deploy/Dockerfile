FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend .

ENV FLAG="vrnctf{sw4gg3r_1n_sw4gg3r_1n_sw4gg3r_m4z3_2025}"

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
