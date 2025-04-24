FROM aecgeeks/ifcopenshell:22.04

WORKDIR /app/converter

ENV CONVERTER_PORT=${CONVERTER_PORT}

USER root

RUN apt-get update && \
    apt-get install -y python3-pip

COPY . .

RUN pip3 install -r requirements.txt

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${CONVERTER_PORT}"]
