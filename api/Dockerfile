FROM python:slim-bookworm

WORKDIR /app/api

ENV API_PORT=${API_PORT}

COPY . .

RUN pip3 install -r requirements.txt

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${API_PORT}"]