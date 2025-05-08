import pika
import time
import random
import json
from datetime import datetime, timedelta
import uuid

# Conexão com o RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

# Declaração da fila
channel.queue_declare(queue='business_data')

# Função para gerar latitude e longitude dentro dos limites da Reserva Natural da Serra da Estrela
def generate_coordinates():
    # Limites aproximados da Reserva Natural da Serra da Estrela
    lat_min, lat_max = 40.268, 40.436
    lon_min, lon_max = -7.733, -7.317

    latitude = round(random.uniform(lat_min, lat_max), 6)
    longitude = round(random.uniform(lon_min, lon_max), 6)

    return latitude, longitude

# IDs fixos para as entidades com coordenadas geradas uma vez
raw_material_producers = [
    {"id": str(uuid.uuid4()), "name": "Producer A", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Producer B", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Producer C", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
]

cheese_factories = [
    {"id": str(uuid.uuid4()), "name": "Cheese Factory X", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Cheese Factory Y", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Cheese Factory Z", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
]

sellers = [
    {"id": str(uuid.uuid4()), "name": "Seller 1", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Seller 2", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Seller 3", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
]

# Função para simular dados de produtores de matérias-primas
def simulate_raw_material_producer(producer):
    data = {
        "id": producer["id"],
        "name": producer["name"],
        "type": "Raw Material Producer",
        "latitude": producer["latitude"],
        "longitude": producer["longitude"],
        "product": random.choice(["Wheat", "Corn", "Milk", "Olives", "Almonds"]),
        "production_date": (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d'),
        "pest_control_techniques": random.choice(["Organic", "Chemical", "Integrated Pest Management"]),
        "waste_management": random.choice(["Recycling", "Composting", "Disposal"]),
        "biodiversity_conservation": random.choice(["Crop rotation", "Agroforestry", "No conservation"]),
        "ecological_footprint": round(random.uniform(0.5, 5.0), 2),
        "water_consumption": round(random.uniform(1000, 10000), 2),  # Litros
        "energy_consumption": round(random.uniform(500, 5000), 2),   # kWh
        "quantity_produced": random.randint(1000, 10000),  # kg
        "annual_expense": round(random.uniform(10000, 100000), 2),
        "annual_profit": round(random.uniform(5000, 80000), 2),
        "number_of_employees": random.randint(5, 50)
    }
    return data

# Função para simular dados de queijarias
def simulate_cheese_factory(factory):
    data = {
        "id": factory["id"],
        "name": factory["name"],
        "type": "Cheese Factory",
        "latitude": factory["latitude"],
        "longitude": factory["longitude"],
        "production_date": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d'),
        "raw_materials": random.choice(["Milk", "Goat Milk", "Buffalo Milk"]),
        "waste_management": random.choice(["Recycling", "Disposal"]),
        "ecological_footprint": round(random.uniform(1.0, 10.0), 2),
        "water_consumption": round(random.uniform(500, 5000), 2),  # Litros
        "energy_consumption": round(random.uniform(100, 2000), 2),  # kWh
        "cheese_quantity": random.randint(100, 5000),  # kg
        "annual_expense": round(random.uniform(20000, 150000), 2),
        "annual_profit": round(random.uniform(15000, 120000), 2),
        "price_per_unit": round(random.uniform(10.0, 50.0), 2),  # Preço por unidade
        "number_of_employees": random.randint(5, 30)
    }
    return data

# Função para simular dados de vendedores
def simulate_seller(seller):
    data = {
        "id": seller["id"],
        "name": seller["name"],
        "type": "Seller",
        "latitude": seller["latitude"],
        "longitude": seller["longitude"],
        "products_sold": random.choice(["Cheese", "Fruits", "Vegetables", "Dairy Products", "Olive Oil"]),
        "store_location": random.choice(["City Center", "Suburbs", "Rural Area"]),
        "daily_transactions": random.randint(50, 300),
        "daily_profit": round(random.uniform(500, 5000), 2),
        "number_of_employees": random.randint(2, 15),
        "daily_energy_consumption": round(random.uniform(50, 200), 2),  # kWh
        "customer_satisfaction_score": round(random.uniform(3.0, 5.0), 2),  # Escala de 1 a 5
        "daily_ecological_footprint": round(random.uniform(0.1, 2.0), 2)
    }
    return data

# Enviar dados de cada entidade a cada 5 segundos
try:
    while True:
        for producer in raw_material_producers:
            message = json.dumps(simulate_raw_material_producer(producer))
            channel.basic_publish(exchange='', routing_key='business_data', body=message)
            print(f" [x] Sent Producer: {message}")
        
        for factory in cheese_factories:
            message = json.dumps(simulate_cheese_factory(factory))
            channel.basic_publish(exchange='', routing_key='business_data', body=message)
            print(f" [x] Sent Factory: {message}")
        
        for seller in sellers:
            message = json.dumps(simulate_seller(seller))
            channel.basic_publish(exchange='', routing_key='business_data', body=message)
            print(f" [x] Sent Seller: {message}")
        
        time.sleep(5)  # Esperar 5 segundos antes de enviar os próximos dados
except KeyboardInterrupt:
    print("Interrompido pelo utilizador")
    connection.close()
