from flask import Flask, render_template, request, jsonify
import socket
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps, ObjectId
import json
import threading
# docker run --name ordersdb -p 27018:27017 -d mongodb/mongodb-community-server:latest //Command for MongoDB creation
# python -m venv .venv // create py virtual environment
# .venv\Scripts\activate // activate virtual environment
# py app\orderAPI.py // run the app 

# Kafka imports

from confluent_kafka import Producer, KafkaException, KafkaError, Consumer
from confluent_kafka.admin import AdminClient, NewTopic

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = 'kafka:19092'
# TOPIC_NAME = 'order-topic'
RESPONSE_TOPIC = 'order-response-topic'
# Kafka producer
kafka_producer = Producer({'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS})

def delivery_report(err, msg):
    if err:
        print(f"Message delivery failed: {err}")
    else:
        print(f"Message delivered to {msg.topic()} [{msg.partition()}]")
# Kafka consumer configuration
consumer_config = {
    'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
    'group.id': 'orderapi-group',
    'auto.offset.reset': 'earliest'
}
kafka_consumer = Consumer(consumer_config)
kafka_consumer.subscribe([RESPONSE_TOPIC])
# kafka_consumer.subscribe(['product-topic'])

# def consume_products():
#     while True:
#         msg = kafka_consumer.poll(1.0)  # Poll for messages
#         if msg is None:
#             continue
#         if msg.error():
#             if msg.error().code() == KafkaError._PARTITION_EOF:
#                 continue
#             else:
#                 print(f"Consumer error: {msg.error()}")
#                 continue
        
#         # Process the message
#         product_message = msg.value().decode('utf-8')
#         print(f"Received product message: {product_message}")
#         # Add any additional logic here


#####################################

app = Flask(__name__)

# Enable CORS for the whole app or specific routes
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# MongoDB connection setup
client = MongoClient("mongodb://ordersdb:27017/")  # FOR DOCKER
# client = MongoClient("mongodb://localhost:27018/")  # FOR LOCAL
db = client['myDatabase'] 
products_collection = db['products']  



@app.route("/")
def index():
    try:
        host_name = socket.gethostname()
        host_ip = socket.gethostbyname(host_name)
        return "Hello, World,re foti!", 200
    except Exception:
        return render_template('error.html')


# Route to get a product by its ID
@app.route("/orders", methods=["GET"])
def get_product():
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

        else:
            found_products = list(products_collection.find())
            return dumps(found_products), 200
    except Exception as e:
        return str(e), 404

# def create_topic(topic_name, num_partitions=1, replication_factor=1):
#     """
#     Creates a Kafka topic if it doesn't already exist.
#     """
#     try:
#         admin_client = AdminClient({'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS})
#         topics = admin_client.list_topics(timeout=10).topics

#         if topic_name in topics:
#             print(f"Topic '{topic_name}' already exists.")
#             return

#         new_topic = NewTopic(
#             topic=topic_name,
#             num_partitions=num_partitions,
#             replication_factor=replication_factor,
#             config={"cleanup.policy": "delete"}
#         )
#         admin_client.create_topics([new_topic])
#         print(f"Topic '{topic_name}' created successfully.")
#     except KafkaException as e:
#         print(f"Failed to create topic '{topic_name}': {e}")
#         if isinstance(e.args[0], KafkaError) and e.args[0].code() == KafkaError.TOPIC_ALREADY_EXISTS:
#             print(f"Topic '{topic_name}' already exists.")
#         else:
#             raise

@app.route("/orders", methods=["POST"])
def save_product():
    try:
        # Get the new product data from the request
        product = request.get_json()

         # Extract fields from the request
        username = product.get("username")  # Extract the username
        products = product.get("products")  # Extract the products array
        # total = product.get("total_price")  # Extract the total price

        # if not product.get("productName") or product.get("priceTag") is None:         //CHECK IT LATER
        #     return {"message": "Product name and price are required"}, 400

        # Insert the new product into the MongoDB collection
        total = 0
        order_items = []

        for item in products:
            product_id = item.get("product_id")
            title = item.get("title")
            quantity = item.get("amount")
            price = item.get("price")
        
            if not product_id or not title or not quantity or not price:
                return jsonify({"message": f"Missing data for item: {item}"}), 400
            if quantity <= 0:
                return jsonify({"message": f"Invalid quantity for {title}"}), 400

            total += price * quantity
            order_items.append({
                "product_id": product_id,
                "productName": title,
                "quantity": quantity,
                "price": price
            })
        order = {
            "user_name": username,
            "items": order_items,
            "total": total,
            "status": "Pending"
        }

        result = products_collection.insert_one(order)
        order["_id"] = str(result.inserted_id)  # Add MongoDB's _id to the order object


        # Send order details to Kafka
        kafka_message = {
            "_id": order["_id"], 
            "user_name": username,
            "order_items": products,
            "total": total,
            "status": "Pending"
        }
        kafka_producer.produce(
            'order-topic', 
            # value=str(kafka_message), 
            value = json.dumps(kafka_message),
            callback=delivery_report
        )
        kafka_producer.flush()

        return "Product saved successfully!", 201
    except Exception as e:
        return str(e), 500


@app.route("/orders", methods=["DELETE"])
def delete_product():
    try:
        # Get the product ID from the request query
        data = request.args
        product_id = data.get('_id')

        if product_id is None:
            return {"message": "Product ID is missing!"}, 400

        # Delete the product with the matching ID from MongoDB
        result = products_collection.delete_one({"_id": ObjectId(product_id)})

        if result.deleted_count == 0:
            return f"Product ID: {product_id} not found!", 404

        return f"Product ID: {product_id} deleted successfully!", 200
    except Exception as e:
        return str(e), 500

def consume_order_status():
    try:
        while True:
            msg = kafka_consumer.poll(timeout=1.0)  # Timeout in seconds

            if msg is None:
                continue  # No message received in the poll interval
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    print(f"Reached end of partition for {msg.topic()} [{msg.partition()}]")
                else:
                    print(f"Error: {msg.error()}")
                continue

            # Process the consumed message
            try:
                status_message = msg.value().decode('utf-8')
                print(f"Consumed message from 'order-status-topic': {status_message}")

                # Parse the message
                status_data = json.loads(status_message)
                order_id = status_data.get('_id')
                status = status_data.get('status')

                if not order_id or not status:
                    print("Invalid status message format!")
                    continue

                # Update the order status in the database
                result = products_collection.update_one(
                    {"_id": ObjectId(order_id)},  # Match the order ID
                    {"$set": {"status": status}}  # Update the status
                )

                if result.matched_count > 0:
                    print(f"Order {order_id} status updated to {status}.")
                else:
                    print(f"Order {order_id} not found in the database.")

            except json.JSONDecodeError:
                print("Failed to decode message as JSON!")
            except Exception as e:
                print(f"Error processing message: {e}")

    except Exception as e:
        print(f"Consumer stopped due to error: {e}")
    finally:
        kafka_consumer.close()

# Start the consumer in a separate thread
consumer_thread = threading.Thread(target=consume_order_status, daemon=True)
consumer_thread.start()


if __name__ == "__main__":
    # try:
    #     # Call the function to create the Kafka topic during initialization
    #     create_topic(TOPIC_NAME)
    # except Exception as e:
    #     print(f"Error during topic creation: {e}")
    app.run(host='0.0.0.0', port=8081)


