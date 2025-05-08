import pika
import json
from influxdb_client import InfluxDBClient, Point
import sys
import os

# Configurações do InfluxDB
token = "jdwJKHJVUM_X-2Oi4Pfzaw6J_mWsmh7CXKcrRh1ryuweJFDXu73nMUG21DlweLl6r3QaE0PNbPjUu2KX3yhQ_A=="  # Substitua pelo seu token do InfluxDB
org = "Estrela-Geopark"      # Substitua pela sua organização
bucket = "cheese_production"      # Substitua pelo bucket configurado no InfluxDB

# Conexão com o InfluxDB
influx_client = InfluxDBClient(url="http://localhost:8086", token=token, org=org)
write_api = influx_client.write_api()

# Função para processar mensagens do RabbitMQ e enviar ao InfluxDB
def write_to_influxdb(message):
    try:
        data = json.loads(message)
        entity_type = data.get("type")  # Identificar o tipo da entidade
        point = None

        if entity_type == "Raw Material Producer":
            point = (
                Point("raw_material_producer")
                .tag("id", data["id"])
                .tag("name", data["name"])
                .field("product", data["product"])
                .field("latitude", data["latitude"])  # Adicionando latitude
                .field("longitude", data["longitude"])  # Adicionando longitude
                .field("ecological_footprint", data["ecological_footprint"])
                .field("water_consumption", data["water_consumption"])
                .field("energy_consumption", data["energy_consumption"])
                .field("quantity_produced", data["quantity_produced"])
                .field("annual_expense", data["annual_expense"])
                .field("annual_profit", data["annual_profit"])
                .field("number_of_employees", data["number_of_employees"])
            )

        elif entity_type == "Cheese Factory":
            point = (
                Point("cheese_factory")
                .tag("id", data["id"])
                .tag("name", data["name"])
                .field("raw_materials", data["raw_materials"])
                .field("latitude", data["latitude"])  # Adicionando latitude
                .field("longitude", data["longitude"])  # Adicionando longitude
                .field("ecological_footprint", data["ecological_footprint"])
                .field("water_consumption", data["water_consumption"])
                .field("energy_consumption", data["energy_consumption"])
                .field("cheese_quantity", data["cheese_quantity"])
                .field("annual_expense", data["annual_expense"])
                .field("annual_profit", data["annual_profit"])
                .field("price_per_unit", data["price_per_unit"])
                .field("number_of_employees", data["number_of_employees"])
            )

        elif entity_type == "Seller":
            point = (
                Point("seller")
                .tag("id", data["id"])
                .tag("name", data["name"])
                .field("products_sold", data["products_sold"])
                .field("latitude", data["latitude"])  # Adicionando latitude
                .field("longitude", data["longitude"])  # Adicionando longitude
                .field("daily_transactions", data["daily_transactions"])
                .field("daily_profit", data["daily_profit"])
                .field("number_of_employees", data["number_of_employees"])
                .field("daily_energy_consumption", data["daily_energy_consumption"])
                .field("customer_satisfaction_score", data["customer_satisfaction_score"])
                .field("daily_ecological_footprint", data["daily_ecological_footprint"])
            )

        if point:
            write_api.write(bucket=bucket, org=org, record=point)
            print(f" [x] Data written to InfluxDB: {data}")
        else:
            print(f" [!] Unknown entity type: {entity_type}")

    except Exception as e:
        print(f" [!] Error writing to InfluxDB: {e}")

# Função principal para consumir mensagens do RabbitMQ
def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    channel.queue_declare(queue='business_data')

    def callback(ch, method, properties, body):
        print(f" [x] Received {body}")
        write_to_influxdb(body)

    channel.basic_consume(queue='business_data', on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
