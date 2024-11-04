from flask import Flask, render_template, request, jsonify
import socket
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps, ObjectId

# docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest //Command for MongoDB creation
# python -m venv myvenv // create py virtual environment
# myvenv\Scripts\activate // activate virtual environment
# py app\newAPI.py // run the app 

app = Flask(__name__)

# Enable CORS for the whole app or specific routes
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# MongoDB connection setup
#client = MongoClient("mongodb://mongodb:27017/") # FOR DOCKER
client = MongoClient("mongodb://localhost:27017/") # FOR LOCAL
db = client['myDatabase'] 
products_collection = db['products'] 


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


@app.route("/products", methods=["POST"])
def save_product():
    try:
        # Get the new product data from the request
        product = request.get_json()

        if not product.get("productName") or product.get("priceTag") is None:
            return {"message": "Product name and price are required"}, 400

        # Insert the new product into the MongoDB collection
        products_collection.insert_one(product)

        return "Product saved successfully!", 201
    except Exception as e:
        return str(e), 500


@app.route("/products", methods=["DELETE"])
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


# @app.route("/products", methods=["PUT"])
# def update_product():
#     try:
#         # Get the product data from the request body (JSON)
#         data = request.args
#         up_data = request.get_json()
#         product_id = data.get("_id")

#         if not product_id:
#             return jsonify({"message": "Product ID is missing!"}), 400

#         updated_product = {
#             "productName": up_data.get("productName"),
#             "priceTag": up_data.get("priceTag"),
#             "productImage": up_data.get("productImage"),
#             "quantity": up_data.get("quantity")
#         }

#         # Ensure mandatory fields are present
#         if not updated_product["productName"] or updated_product["priceTag"] is None:
#             return jsonify({"message": "Product name and price are required!"}), 400

#         # Update product in the database by its ObjectId
#         result = products_collection.update_one({"_id": ObjectId(product_id)}, {"$set": updated_product})

#         # Check if the product was found and updated
#         if result.matched_count == 0:
#             return jsonify({"message": f"Product ID: {product_id} not found!"}), 404

#         return jsonify({"message": f"Product ID: {product_id} updated successfully!"}), 200
#     except Exception as e:
#         return jsonify({"message": str(e)}), 500

@app.route("/products/<product_id>", methods=["PUT"])
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
    app.run(host='0.0.0.0', port=8080)


