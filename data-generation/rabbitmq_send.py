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
channel.queue_declare(queue='sensor_data')

# Função para gerar latitude e longitude dentro dos limites da Reserva Natural da Serra da Estrela
def generate_coordinates():
    # Limites aproximados da Reserva Natural da Serra da Estrela
    lat_min, lat_max = 40.268, 40.436
    lon_min, lon_max = -7.733, -7.317

    latitude = round(random.uniform(lat_min, lat_max), 6)
    longitude = round(random.uniform(lon_min, lon_max), 6)

    return latitude, longitude

# IDs fixos para as entidades com coordenadas geradas uma vez
producers = [
    {"id": str(uuid.uuid4()), "name": "Producer A", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Producer B", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Producer C", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
]

manufacturers = [
    {"id": str(uuid.uuid4()), "name": "Cheese Factory X", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Cheese Factory Y", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Cheese Factory Z", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
]

sellers = [
    {"id": str(uuid.uuid4()), "name": "Seller 1", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Seller 2", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Seller 3", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
]

#lista de produtos de queijo e matérias-primas
products = [
    {"id": str(uuid.uuid4()), "name": "Queijo A", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Queijo B", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Queijo C", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
]

raw_products = [
    {"id": str(uuid.uuid4()), "name": "Leite A", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Leite B", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
    {"id": str(uuid.uuid4()), "name": "Leite C", **dict(zip(["latitude", "longitude"], generate_coordinates()))},
]

policy_makers = [
    {"id": str(uuid.uuid4()), "name": "Policymaker A"},
    {"id": str(uuid.uuid4()), "name": "Policymaker B"},
    {"id": str(uuid.uuid4()), "name": "Policymaker C"},
]

regulators = [
    {"id": str(uuid.uuid4()), "name": "Regulator A"},
    {"id": str(uuid.uuid4()), "name": "Regulator B"},
    {"id": str(uuid.uuid4()), "name": "Regulator C"},
]



# Função para simular dados de produtos
def simulate_product(product):
    latitude = product["latitude"]
    longitude = product["longitude"]

    data = {
        "id": product["id"],
        "name": product["name"],
        "model": "dtmi:DigitalTwin:Product;1",
        "type": "Cheese Product",
        "production_location": {
            "latitude": latitude,
            "longitude": longitude,
            "street": random.choice(["Rua do Queijo", "Travessa do Sabor", "Avenida da Cura"]),
            "city": random.choice(["Gouveia", "Seia", "Manteigas"]),
            "country": "Portugal"
        },
        "certification": random.choice(["PDO", "PGI", "Organic", "Nenhuma"]),
        "production_date": (datetime.now() - timedelta(days=random.randint(0, 90))).isoformat()
    }
    return data

# Função para simular dados de matérias-primas
def simulate_raw_product(raw_product):
    latitude = raw_product["latitude"]
    longitude = raw_product["longitude"]

    data = {
        "id": raw_product["id"],
        "name": raw_product["name"],
        "type": "Raw Product",
        "production_location": {
            "latitude": latitude,
            "longitude": longitude,
            "street": random.choice(["Rua das Vinhas", "Estrada do Leite", "Caminho das Pastagens"]),
            "city": random.choice(["Gouveia", "Seia", "Manteigas"]),
            "country": "Portugal"
        },
        "certification": random.choice(["Organic", "GlobalG.A.P.", "Nenhuma"]),
        "production_date": (datetime.now() - timedelta(days=random.randint(1, 120))).isoformat()
    }
    return data

# Função para simular dados de produtores de matérias-primas
def simulate_producer(producer):
    latitude = producer["latitude"]
    longitude = producer["longitude"]

    pest_techniques = random.sample(
        ["Organic", "Chemical", "Integrated Pest Management", "Biological Control"], 
        k=random.randint(1, 3)
    )
    waste_management = random.sample(
        ["Recycling", "Composting", "Disposal", "Incineration"], 
        k=random.randint(1, 3)
    )

    total_employees = random.randint(5, 50)

    data = {
        "id": producer["id"],
        "name": producer["name"],
        "model": "dtmi:DigitalTwin:Producer;1",
        "type": "Raw Material Producer",
        "pest_control_techniques": "; ".join(pest_techniques),
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "street": random.choice(["Rua do Campo", "Estrada Agrícola", "Travessa das Oliveiras"]),
            "city": random.choice(["Gouveia", "Seia", "Manteigas"]),
            "country": "Portugal"
        },
        "certification": random.choice(["GlobalG.A.P.", "ISO 14001", "Nenhuma"]),
        "contact": f"+351 9{random.randint(10000000, 99999999)}",
        "production_capacity": round(random.uniform(500.0, 10000.0), 2),
        "ecological_footprint": round(random.uniform(0.5, 5.0), 2),
        "waste_generation": round(random.uniform(50.0, 300.0), 2),
        "waste_management_types": "; ".join(waste_management),
        "energy_consumption": round(random.uniform(500.0, 5000.0), 2),   # kWh
        "water_consumption": round(random.uniform(1000.0, 10000.0), 2),  # Litros
        "timestamp": datetime.now().isoformat(),
        "last_audit": (datetime.now() - timedelta(days=random.randint(30, 365))).isoformat(),
        "anual_profit": round(random.uniform(5000.0, 80000.0), 2),
        "anual_expenses": round(random.uniform(10000.0, 100000.0), 2),
        "num_employees": total_employees
        # Nota: relação "produces" não precisa ser simulada aqui — é feita no Digital Twin
    }
    return data


# Função para simular dados de queijarias
def simulate_manufacturer(factory):
    latitude = factory["latitude"]
    longitude = factory["longitude"]

    data = {
        "id": factory["id"],
        "name": factory["name"],
        "model": "dtmi:DigitalTwin:Manufacturer;1",
        "type": "Cheese Factory",
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "street": random.choice(["Rua da Fábrica", "Avenida dos Queijos", "Travessa das Cabras"]),
            "city": random.choice(["Gouveia", "Seia", "Manteigas"]),
            "country": "Portugal"
        },
        "certification": random.choice(["ISO 22000", "BRC", "IFS", "Nenhuma"]),
        "contact": f"+351 2{random.randint(10000000, 99999999)}",
        "ecological_footprint": round(random.uniform(1.0, 10.0), 2),
        "waste_generation": round(random.uniform(50.0, 500.0), 2),
        "waste_management_types": random.choice(["Recycling", "Disposal", "Composting"]),
        "raw_materials": random.choice(["Milk", "Goat Milk", "Buffalo Milk"]),
        "cheese_production_capacity": round(random.uniform(1000.0, 10000.0), 2),
        "energy_consumption": round(random.uniform(100.0, 2000.0), 2),  # kWh
        "water_consumption": round(random.uniform(500.0, 5000.0), 2),  # Litros
        "price_per_unit": round(random.uniform(10.0, 50.0), 2),
        "annual_profit": round(random.uniform(15000.0, 120000.0), 2),
        "annual_expenses": round(random.uniform(20000.0, 150000.0), 2),
        "num_employees": (total := random.randint(10, 30)),
        "num_female_employees": (females := random.randint(0, total)),
        "num_male_employees": total - females,
        "timestamp": datetime.now().isoformat(),
        "last_audit": (datetime.now() - timedelta(days=random.randint(30, 365))).isoformat()
    }
    return data


# Função para simular dados de vendedores
def simulate_seller(seller):
    latitude = seller["latitude"]
    longitude = seller["longitude"]

    num_employees = random.randint(5, 100)
    num_female = random.randint(0, num_employees)
    num_male = num_employees - num_female

    data = {
        "id": seller["id"],
        "name": seller["name"],
        "model": "dtmi:DigitalTwin:Seller;1",
        "type": "Seller",
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "street": random.choice(["Rua do Comércio", "Avenida Central", "Travessa do Mercado"]),
            "city": random.choice(["Gouveia", "Seia", "Manteigas"]),
            "country": "Portugal"
        },
        "certification": random.choice(["FairTrade", "ISO 9001", "Nenhuma"]),
        "contact": f"+351 9{random.randint(10000000, 99999999)}",
        "ecological_footprint": round(random.uniform(0.1, 3.5), 2),
        "waste_generation": round(random.uniform(10.0, 150.0), 2),
        "energy_consumption": round(random.uniform(300.0, 5000.0), 2),
        "water_consumption": round(random.uniform(500.0, 10000.0), 2),
        "timestamp": datetime.now().isoformat(),
        "last_audit": (datetime.now() - timedelta(days=random.randint(30, 365))).isoformat(),
        "anual_profit": round(random.uniform(5000.0, 90000.0), 2),
        "anual_expenses": round(random.uniform(10000.0, 120000.0), 2),
        "quantity_sold": round(random.uniform(100.0, 10000.0), 2),
        "num_employees": num_employees,
        "num_female_employees": num_female,
        "num_male_employees": num_male
    }
    return data

# Função para simular dados de entidades reguladoras
def simulate_policy_maker(policymaker):
    data = {
        "id": policymaker["id"],
        "name": policymaker["name"],
        "model": "dtmi:DigitalTwin:Policymaker;1",
        "institution": random.choice(["Ministério da Agricultura", "Agência do Ambiente", "Câmara Municipal"]),
        "role": random.choice(["Inspector", "Gestor Ambiental", "Técnico de Políticas Públicas"]),
        "regulations": "; ".join(random.sample([
            "Regulamento UE 2023/1115", 
            "Lei da Água", 
            "Normas de Produção Biológica", 
            "Diretiva Resíduos 2008/98/CE"
        ], k=random.randint(1, 3))),
        "contact": f"{policymaker['name'].lower().replace(' ', '.')}@gov.pt",
        "region": random.choice(["Centro", "Norte", "Alentejo", "Lisboa e Vale do Tejo"]),
        "decision_level": random.choice(["local", "regional", "nacional", "europeu"])
    }
    return data

# Função para simular dados de reguladores
def simulate_regulator(regulator):
    data = {
        "id": regulator["id"],
        "name": regulator["name"],
        "model": "dtmi:DigitalTwin:Regulator;1",
        "institution": random.choice([
            "Agência Portuguesa do Ambiente", 
            "Direção-Geral de Agricultura e Desenvolvimento Rural", 
            "Comissão Europeia"
        ]),
        "certification_authority": random.choice([
            "CertiBio", "EcoGarantia", "ISO", "SGS", "DNV"
        ]),
        "compliance_rules": "; ".join(random.sample([
            "ISO 14001", 
            "Regulamento (CE) nº 834/2007", 
            "Codex Alimentarius", 
            "Lei de Segurança Alimentar", 
            "REACH"
        ], k=random.randint(1, 3))),
        "contact": f"{regulator['name'].lower().replace(' ', '.')}@reguladores.pt",
        "audit_frequency": random.randint(1, 4),  # vezes por ano
        "total_audits": (total := random.randint(10, 100)),
        "non_compliance_count": random.randint(0, total // 2)
    }
    return data


# Enviar dados de cada entidade a cada 5 segundos
try:
    while True:
        for producer in producers:
            message = json.dumps(simulate_producer(producer))
            channel.basic_publish(exchange='', routing_key='sensor_data', body=message)
            print(f" [x] Sent Producer: {message}")
        
        for factory in manufacturers:
            message = json.dumps(simulate_manufacturer(factory))
            channel.basic_publish(exchange='', routing_key='sensor_data', body=message)
            print(f" [x] Sent Factory: {message}")
        
        for seller in sellers:
            message = json.dumps(simulate_seller(seller))
            channel.basic_publish(exchange='', routing_key='sensor_data', body=message)
            print(f" [x] Sent Seller: {message}")

        for product in products:
            message = json.dumps(simulate_product(product))
            channel.basic_publish(exchange='', routing_key='sensor_data', body=message)
            print(f" [x] Sent Product: {message}")

        for raw_product in raw_products:
            message = json.dumps(simulate_raw_product(raw_product))
            channel.basic_publish(exchange='', routing_key='sensor_data', body=message)
            print(f" [x] Sent Raw Product: {message}")

        for policymaker in policy_makers:
            message = json.dumps(simulate_policy_maker(policymaker))
            channel.basic_publish(exchange='', routing_key='sensor_data', body=message)
            print(f" [x] Sent Policymaker: {message}")

        for regulator in regulators:
            message = json.dumps(simulate_regulator(regulator))
            channel.basic_publish(exchange='', routing_key='sensor_data', body=message)
            print(f" [x] Sent Regulator: {message}")
        
        time.sleep(15)  # Esperar 5 segundos antes de enviar os próximos dados
except KeyboardInterrupt:
    print("Interrompido pelo utilizador")
    connection.close()
