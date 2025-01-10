from flask import Flask, render_template, request, jsonify, send_from_directory
import socket
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps, ObjectId
from werkzeug.utils import secure_filename
import os
# from threading import Thread
import threading
import json
import logging


##### F.V. 1.0 #####

import jwt # PyJWT
from jwt import PyJWKClient, ExpiredSignatureError, InvalidTokenError
from werkzeug.utils import secure_filename
from flask import send_from_directory
from functools import wraps

# ------------------ CONFIGURATIONS ------------------
# Keycloak Config
KEYCLOAK_SERVER = "http://react_start-keycloak-w-1:8182"
REALM_NAME = "eshop"
KEYCLOAK_PUBLIC_KEY_URL = f"{KEYCLOAK_SERVER}/realms/{REALM_NAME}/protocol/openid-connect/certs"
AUDIENCE = "account"
#####           

from confluent_kafka import Producer, KafkaException, KafkaError, Consumer
from confluent_kafka.admin import AdminClient, NewTopic

# docker compose down && docker image prune -f && docker compose up --build
# docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest //Command for MongoDB creation
# python -m venv myvenv // create py virtual environment
# myvenv\Scripts\activate // activate virtual environment

# py app\newAPI.py // run the app 


###docker cleaup
##ps aux | grep docker
## find PIDS
## kill -9 PID
## docker-compose down
#docker system prune -af
#docker volume prune -f
# sudo systemctl restart docker



##### F.V. 1.0 #####
# ---------------- TOKEN VALIDATION ----------------
def validate_token(token):
    """Validate a JWT token using Keycloak JWKS URL."""
    try:
        # Fetch the public key
        print("Fetching signing key from JWKS URL...")
        jwks_client = PyJWKClient(KEYCLOAK_PUBLIC_KEY_URL)
        print("JWKS Client initialized successfully.")
        
        header = jwt.get_unverified_header(token)
        print(f"JWT Header: {header}")

        signing_key = jwks_client.get_signing_key_from_jwt(token).key
        print(f"Signing Key: {signing_key}")

        # Decode the token
        decoded_token = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience=AUDIENCE,
            options={"verify_exp": True}  # Ensure expiration is verified
        )
        print(f"Decoded Token: {decoded_token}")  # Debugging output
        return decoded_token
    except ExpiredSignatureError:
        print("Token has expired.")
        return None
    except InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        print(f"Authorization Header: {auth_header}")  # Debug
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"message": "Token is missing or invalid"}), 401
        token = auth_header.split(" ")[1]
        print(f"Token: {token}")  # Debug
        decoded_token = validate_token(token)
        print(f"Decoded Token: {decoded_token}")  # Debug
        if not decoded_token:
            print("Token validation failed")  # Debug
            return jsonify({"message": "Invalid or expired token"}), 401
        request.user = decoded_token
        return f(*args, **kwargs)
    return decorated



#####

app = Flask(__name__)


# Enable CORS for all routes and methods, including Authorization headers

#for local

# CORS(
#     app,
#     resources={r"/*": {"origins": ["http://127.0.0.1:5173", "http://localhost:5173"]}},
#     supports_credentials=True,
#     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#     allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"],
#     expose_headers=["Authorization"]
# )

#### fro gcp
CORS(
    app,
    resources={r"/*": {"origins": ["http://35.219.242.217:5173", "http://127.0.0.1:5173"]}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"],
    expose_headers=["Authorization"]
)




# MongoDB connection setup
client = MongoClient("mongodb://mongodb:27017/") # FOR DOCKER
# client = MongoClient("mongodb://localhost:27017/") # FOR LOCAL
db = client['myDatabase'] 
products_collection = db['products'] 

# Configure the upload folder and allowed extensions
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'uploads')
# UPLOAD_FOLDER = '/static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_topic(topic_name, num_partitions=1, replication_factor=1):
    """
    Creates a Kafka topic if it doesn't already exist.
    """
    try:
        admin_client = AdminClient({'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS})
        topics = admin_client.list_topics(timeout=10).topics

        if topic_name in topics:
            print(f"Topic '{topic_name}' already exists.")
            return

        new_topic = NewTopic(
            topic=topic_name,
            num_partitions=num_partitions,
            replication_factor=replication_factor,
            config={"cleanup.policy": "delete"}
        )
        admin_client.create_topics([new_topic])
        print(f"Topic '{topic_name}' created successfully.")
    except KafkaException as e:
        print(f"Failed to create topic '{topic_name}': {e}")
        if isinstance(e.args[0], KafkaError) and e.args[0].code() == KafkaError.TOPIC_ALREADY_EXISTS:
            print(f"Topic '{topic_name}' already exists.")
        else:
            raise

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = 'kafka:19092'
ORDER_TOPIC = 'order-topic'
RESPONSE_TOPIC = 'order-response-topic'

consumer_config = {
    'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
    'group.id': 'newapi-group',
    'auto.offset.reset': 'earliest'
}
kafka_consumer = Consumer(consumer_config)


# Kafka producer
kafka_producer = Producer({'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS})
kafka_consumer.subscribe([ORDER_TOPIC])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def produce_message(topic, message):
    try:
        kafka_producer.produce(topic, value=json.dumps(message))
        kafka_producer.flush()
        logging.info(f"Produced message to topic {topic}: {message}")
    except Exception as e:
        logging.error(f"Failed to produce message to Kafka: {e}")

def consume_messages():
    while True:
        try:
            msg = kafka_consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    logging.error(f"Kafka Consumer error: {msg.error()}")
                    continue

            # Ensure the message is properly deserialized
            try:
                order_message = json.loads(msg.value().decode('utf-8'))
                process_order(order_message)
            except json.JSONDecodeError as e:
                logging.error(f"Invalid JSON message: {msg.value().decode('utf-8')}. Error: {e}")
        except Exception as e:
            logging.error(f"Error consuming Kafka messages: {e}")
            break

def process_order(order_message):
    try:
        logging.info(f"Processing order: {order_message}")

        # Extract the MongoDB `_id` from the order_message
        order_id = order_message.get('_id')  # Use `_id` instead of `id`    "{'_id': '674f2b49812f8fbcf0a3435c', 'user_name': 'test', 'order_items': [{'title': 'souvlaki', 
                                                                            #'amount': 5, 'product_id': '674f1304873c0c55ab06e162', 'price': 1}], 'total': 5}"
        if not order_id:
            raise ValueError("Order does not contain '_id'")

        products = order_message.get('order_items', [])
        if not products:
            raise ValueError("Order does not contain 'order_items'")

        # Process each product in the order
        status = "Success" # Default status

        for product in products:
            product_id = product.get('product_id')
            quantity = product.get('amount')

            if not product_id or quantity is None:
                raise ValueError(f"Product data is missing 'product_id' or 'amount': {product}")

            # Fetch the product from the database
            product_record = products_collection.find_one({"_id": ObjectId(product_id)})
            if not product_record:
                reject_message = {"_id": order_id, "status": "Reject", "reason": f"Product {product_id} not found"}
                produce_message('order-response-topic', reject_message)
                logging.warning(f"Product ID {product_id} not found. Order {order_id} rejected.")
                return

            # Check if enough stock is available
            if product_record['quantity'] >= quantity:
                # Update product quantity
                new_quantity = product_record['quantity'] - quantity
                products_collection.update_one(
                    {"_id": ObjectId(product_id)},
                    {"$set": {"quantity": new_quantity}}
                )
                logging.info(f"Product ID {product_id} stock updated. New quantity: {new_quantity}.")
            else:
                status = "Rejected"
                # Reject order if not enough stock
                reject_message = {"_id": order_id, "status": "Reject", "reason": f"Not enough stock for {product_id}"}
                produce_message('order-response-topic', reject_message)
                logging.warning(f"Not enough stock for Product ID {product_id}. Order {order_id} rejected.")
                return

        # If all products are successfully processed, accept the order
        success_message = {"_id": order_id, "status": "Success"}
        produce_message('order-response-topic', success_message)
        
        #logging.info(f"Order {_id} processed successfully.")
    except Exception as e:
        logging.error(f"Error processing order: {e}")


# Start Kafka consumer thread
consumer_thread = threading.Thread(target=consume_messages, daemon=True)
consumer_thread.start()

#### f.v
@app.before_request
def handle_preflight():
    # print("TTTEEEEEEST")
    if request.method == "OPTIONS":
        print("Handling preflight request")
        response = app.response_class()
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, X-Requested-With, Accept, Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200

######

@app.route("/")
def index():
    try:
        host_name = socket.gethostname()
        host_ip = socket.gethostbyname(host_name)
        return "Hello, World!, de douleuei", 200
    except Exception:
        return render_template('error.html')


# Route to get a product by its ID
@app.route("/products", methods=["GET"])
def get_product():

    # kafka_consumer.subscribe(['order-topic'])

    # latest_message = None
    # while True:
    #         msg = kafka_consumer.poll(1.0)  # Poll for a message with a 1-second timeout
    #         if msg is None:
    #             print("No new messages found on 'order-topic'.")
    #             break
    #         if msg.error():
    #             print(f"Kafka error: {msg.error()}")
    #             break

    #         # Capture the latest message
    #         latest_message = msg.value().decode('utf-8')
    #         print(f"Consumed message: {latest_message}")
    #         break  # Exit loop after consuming one message

    # if latest_message:
    #         # Produce the same message to 'product-topic'
    #         kafka_producer.produce(
    #             'product-topic',
    #             value=latest_message,
    #             callback=delivery_report
    #         )
    #         kafka_producer.flush()
    #         print(f"Produced message to 'product-topic': {latest_message}")

    try:
        data = request.args
        # Find the product by its _id
        if "_id" in data:
            product_id = data["_id"]  # Get the ID directly
            found_product = products_collection.find_one({"_id": ObjectId(product_id)})
            return dumps(found_product), 200 if found_product else ({"message": "Product not found"}, 404)

        elif "productName" in data:
            found_products = list(products_collection.find({"productName": data.get("productName")}))
            return dumps(found_products), 200
        
        elif "seller" in data:
            found_products = list(products_collection.find({"seller": data.get("seller")}))
            return dumps(found_products), 200

        else:
            found_products = list(products_collection.find())
            return dumps(found_products), 200
         # Send order details to Kafka
    except Exception as e:
        return str(e), 404

@app.route("/products", methods=["POST"])
@token_required
def save_product():
    if 'imageFile' not in request.files:
        return {"message": "No file part"}, 400
    file = request.files['imageFile']
    if file.filename == '':
        return {"message": "No selected file"}, 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        print(request.host_url)
        # Assuming other product data are sent as form fields
        product_data = {
            "productName": request.form.get('productName'),
            "priceTag": float(request.form.get('priceTag')),
            "quantity": int(request.form.get('quantity')),
            "imageFile": f"http://35.219.242.217:8080/static/uploads/{filename}",  # FOR GCP 
            # "imageFile": f"http://localhost:8080/static/uploads/{filename}",  # FOR LOCAL
            "seller": request.form.get('seller')
        }
        products_collection.insert_one(product_data)
        return {"message": "Product saved successfully!", "filePath": f"{request.host_url}static/uploads/{filename}"}, 201
    
@app.route("/static/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/products", methods=["DELETE"])
@token_required
def delete_product():
    data = request.args
    product_id = data.get('_id')
    if not product_id:
        return {"message": "Product ID is missing!"}, 400
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if product:
        products_collection.delete_one({"_id": ObjectId(product_id)})
        # Remove the image file if it exists
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], product['imageFile'].split('/')[-1])
        if os.path.exists(image_path):
            os.remove(image_path)
        return {"message": f"Product ID: {product_id} and its image deleted successfully!"}, 200
    else:
        return {"message": f"Product ID: {product_id} not found!"}, 400


@app.route("/products/<product_id>", methods=["PUT"])
@token_required
def update_product(product_id):
    try:
        updated_data = request.get_json()

        # Define validation rules
        validations = { 
            "priceTag": lambda x: type(x) in {int, float} and x > 0,  # Price must be a positive number
            "quantity": lambda x: type(x) is int and x >= 0,  # Quantity must be a non-negative integer (allow 0)
        }

        # Validate the incoming data
        for field, validate in validations.items():
            if field in updated_data and not validate(updated_data[field]):
                return jsonify({"message": f"{field.capitalize()} is invalid"}), 400

        # Update the product in MongoDB
        result = products_collection.update_one(
            {"_id": ObjectId(product_id)},  # Find product by its ObjectId
            {"$set": updated_data}  # Set the updated fields (e.g., quantity, price)
        )

        if result.matched_count == 0:
            return jsonify({"message": "Product not found!"}), 404

        return jsonify({"message": "Product updated successfully!"}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == "__main__":
    try:
        # Call the function to create the Kafka topic during initialization
        create_topic(ORDER_TOPIC)
        create_topic(RESPONSE_TOPIC)
    except Exception as e:
        print(f"Error during topic creation: {e}")
    
    #  # Start the Kafka consumer in a separate thread
    # consumer_thread = Thread(target=consume_orders, daemon=True)
    # consumer_thread.start()

    app.run(host='0.0.0.0', port=8080)



