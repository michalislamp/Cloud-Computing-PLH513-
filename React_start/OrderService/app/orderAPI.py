from flask import Flask, render_template, request, jsonify
import socket
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps, ObjectId

# docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest //Command for MongoDB creation
# python -m venv .venv // create py virtual environment
# .venv\Scripts\activate // activate virtual environment
# py app\orderAPI.py // run the app 

app = Flask(__name__)

# Enable CORS for the whole app or specific routes
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# MongoDB connection setup
client = MongoClient("mongodb://localhost:27018/")  # Update the URI if necessary
db = client['myDatabase']  # Use your database name
products_collection = db['products']  # Use your collection name


@app.route("/")
def index():
    try:
        host_name = socket.gethostname()
        host_ip = socket.gethostbyname(host_name)
        return "Hello, World!", 200
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


@app.route("/orders", methods=["POST"])
def save_product():
    try:
        # Get the new product data from the request
        product = request.get_json()

        # if not product.get("productName") or product.get("priceTag") is None:         //CHECK IT LATER
        #     return {"message": "Product name and price are required"}, 400

        # Insert the new product into the MongoDB collection
        products_collection.insert_one(product)

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




if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8081)


