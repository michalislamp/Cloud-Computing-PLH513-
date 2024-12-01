from flask import Flask, render_template, request, jsonify, send_from_directory
import socket
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps, ObjectId
from werkzeug.utils import secure_filename

# NA KANO PERISSOTEROUS LEEGXOUS STO BACK KAI NA KSERO
# px na do pos ginetai na min parageilo ena proion to opooio einai out of stock
# mporoun ta api na epikoinonoun metaksi tous px sto post tou arters na kano ena get sto db tou products kai na do an to proion einai out of stock 
# 


import os

# docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest //Command for MongoDB creation
# python -m venv myvenv // create py virtual environment
# myvenv\Scripts\activate // activate virtual environment
# py app\newAPI.py // run the app 

app = Flask(__name__)

# Enable CORS for the whole app or specific routes
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

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
        
        elif "seller" in data:
            found_products = list(products_collection.find({"seller": data.get("seller")}))
            return dumps(found_products), 200

        else:
            found_products = list(products_collection.find())
            return dumps(found_products), 200
    except Exception as e:
        return str(e), 404

@app.route("/products", methods=["POST"])
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
            "imageFile": f"http://localhost:8080/static/uploads/{filename}",  # Corrected URL path
            "seller": request.form.get('seller')
        }
        products_collection.insert_one(product_data)
        return {"message": "Product saved successfully!", "filePath": f"{request.host_url}static/uploads/{filename}"}, 201
    
@app.route("/static/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/products", methods=["DELETE"])
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



