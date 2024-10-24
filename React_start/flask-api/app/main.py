from flask import Flask,render_template
import socket
import json
from flask import request
import os
from flask_cors import CORS

app = Flask(__name__)


# Enable CORS for the whole app or specific routes
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

@app.route("/")
def index():
    try:
        host_name = socket.gethostname()
        host_ip = socket.gethostbyname(host_name)
        return "Hello, World!", 200
    except:
        return render_template('error.html')

@app.route("/products")
def products():
    try:
        with open('products.json', 'r') as f:
            products = json.load(f)
        return products, 200
    except FileNotFoundError:
        return {"message": "No products found!"}, 404
    except Exception as e:
        return str(e), 500

# @app.route("/save_product", methods=["POST"])
# def save_product():
#         product = {"id": 2, "name": "New Product", "price": 29.99}
#         try:
#             with open('products.json', 'w') as f:
#                 json.dump(product, f)
#             return "Product saved successfully!", 201
#         except Exception as e:
#             return str(e), 500

# @app.route("/save_product", methods=["POST"])
# def save_product():
#     try:
#         product = request.get_json()
#         with open('products.json', 'w') as f:
#             json.dump(product, f)
#         return "Product saved successfully!", 201
#     except Exception as e:
#         return str(e), 500

@app.route("/products", methods=["POST"])
def save_product():
    try:
        # Get the new product data from the request
        product = request.get_json()
        if not product["id"] :
            return {"message": "No input data provided"}, 400


        # Check if the products.json file exists
        if os.path.exists('products.json'):
            # Load the existing products
            with open('products.json', 'r') as f:
                products = json.load(f)
        else:
            # If the file doesn't exist, initialize an empty list
            products = []

        # Add the new product to the list
        products.append(product)

        # Write the updated list back to the file
        with open('products.json', 'w') as f:
            json.dump(products, f, indent=4)

        return "Product saved successfully!", 201
    except Exception as e:
        return str(e), 500

# DELETE endpoint reading ID from request body
@app.route("/products", methods=["DELETE"])
def delete_product():
    try:
        # Get the product ID from the request body (JSON)
        data = request.args
        product_id = int(data.get('id'))

        # Check if the product ID is provided
        if product_id is None:
            return "Product ID is missing!", 400

        # Check if the products.json file exists
        if os.path.exists('products.json'):
            # Load the existing products
            with open('products.json', 'r') as f:
                products = json.load(f)

            # If the file contains a dictionary instead of a list, raise an error
            if isinstance(products, dict):
                return "Invalid format in products.json!", 500

            # Filter out the product with the matching ID
            updated_products = [product for product in products if product.get('id') != product_id]

            # Write the updated list back to the file
            with open('products.json', 'w') as f:
                json.dump(updated_products, f, indent=4)

            # Check if the product was found and deleted
            if len(updated_products) == len(products):
                return f"Product with ID {product_id} not found!", 404

            return f"Product with ID {product_id} deleted successfully!", 200
        else:
            return "Product list not found!", 404
    except Exception as e:
        return str(e), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
