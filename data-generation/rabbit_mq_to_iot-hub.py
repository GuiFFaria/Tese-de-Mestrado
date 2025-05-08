import pika
import json
import sys
import os
from azure.iot.device import IoTHubDeviceClient, Message

# Configurações do Azure IoT Hub
DEVICE_CONNECTION_STRING = "HostName=iot-hub-tese.azure-devices.net;DeviceId=meu-dispositivo;SharedAccessKey=iw7Q57XUvGkQ3dLfLUUx6vBX9KgY7YYqq3B041+yN90="

# Conexão com o Azure IoT Hub
device_client = IoTHubDeviceClient.create_from_connection_string(DEVICE_CONNECTION_STRING)

# Função para processar e enviar mensagens ao IoT Hub
def send_to_iot_hub(message):
    try:
        msg = Message(message)
        device_client.send_message(msg)
        print(f" [x] Mensagem enviada ao IoT Hub: {message}")
    except Exception as e:
        print(f" [!] Erro ao enviar ao IoT Hub: {e}")

# Função principal para consumir mensagens do RabbitMQ
def main():
    RABBITMQ_URL = "localhost"
    QUEUE_NAME = "sensor_data"

    # Conectar ao RabbitMQ
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    channel.queue_declare(queue='sensor_data')

    def callback(ch, method, properties, body):
        message = body.decode('utf-8')
        print(f" [x] Recebido do RabbitMQ: {message}")
        send_to_iot_hub(message)

    channel.basic_consume(queue='sensor_data', on_message_callback=callback, auto_ack=True)

    print(" [*] Aguardando mensagens. Para sair pressione CTRL+C")
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Interrompido pelo usuário")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
    finally:
        connection.close()
        device_client.shutdown()

if __name__ == '__main__':
    main()

