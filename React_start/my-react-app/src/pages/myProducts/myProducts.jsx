import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./myProducts.css";
import { useNavigate } from "react-router-dom";


export const MyProducts = () => {
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [products, setProducts] = useState([]);
    const [tempPrice, setTempPrice] = useState({});
    const [tempQuantity, setTempQuantity] = useState({});
    const navigate = useNavigate();

    

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            alert('Please fill out all fields with valid values.');
            return;
        }

        const seller = localStorage.getItem("preferred_username"); // Assuming the seller's username is stored in localStorage
        // Create FormData to handle file upload
        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('priceTag', parseFloat(price));
        formData.append('imageFile', imageFile);
        formData.append('quantity', parseInt(quantity));
        formData.append('seller', seller);

        // Send POST request with FormData
        axios.post('http://localhost:8080/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            setProductName("");
            setPrice("");
            setImageFile(null);
            setQuantity("");
            fetchProducts();
        })
        .catch((error) => {
            console.error('There was an error adding the product!', error);
        });
    };

    const fetchProducts = () => {
                const seller = localStorage.getItem("preferred_username"); // Assuming the seller's username is stored in localStorage
                console.log(seller);
                axios.get('http://localhost:8080/products',{params: {seller: seller}})
                    .then((response) => {
                        setProducts(response.data);
                    })
                    .catch((error) => {
                        console.error('Error fetching products:', error);
                    });
            };
        
    useEffect(() => {
        const role = localStorage.getItem("user_role");
        if (role !== "seller") {
          navigate("/"); // Redirect to homepage if user is a sller.
        }
        fetchProducts();
    }, []);

    const handleUpdate = (productId, updatedField) => {
        axios.put(`http://localhost:8080/products/${productId}`, updatedField)
            .then((response) => {
                fetchProducts();
            })
            .catch((error) => {
                console.error('Error updating product:', error);
            });
    };

    const handleDelete = (productId) => {
        axios.delete(`http://localhost:8080/products?_id=${productId}`)
            .then((response) => {
                fetchProducts();
            })
            .catch((error) => {
                console.error('Error deleting product:', error);
            });
    };

    // Check if the form is valid
    const isFormValid = () => {
        return (
            productName &&
            parseFloat(price) > 0 &&
            Number.isInteger(Number(quantity)) &&
            parseInt(quantity) > 0 &&
            imageFile
        );
    };


    return (
        <div>
            <div className='adminTitle'>
                <h1>Admin Page</h1>
            </div>

            <div className='myProductsTitle'>
                <h2>Add New Product</h2>
            </div>
            <div className='productForm'>
            <form onSubmit={handleSubmit}>
                <label>Product Name:</label>
                <input 
                    type="text" 
                    value={productName} 
                    onChange={(e) => setProductName(e.target.value)} 
                    required 
                />
                <label>Price:</label>
                <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                />
                <label>Image:</label>
                <input 
                    type="file" 
                    onChange={(e) => setImageFile(e.target.files[0])} 
                    required 
                />
                <label>Quantity:</label>
                <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    required 
                />
                <div className='addButtonContainer'>
                <button className='addProductBttn' type="submit">Add Product</button>
                </div>
            </form>
            </div>

            <div className='myProductsTitle'>
                <h2>Update or Delete Products</h2>
            </div>
            <div className='productList'>
                {products.map((product) => (
                    <div key={product._id.$oid} className="productItem">
                        <img src={product.imageFile} alt={product.productName} />
                        <div>
                            <p><b>Name:</b> {product.productName}</p>
                            <p><b>Price:</b> 
                                <input 
                                    type="number" 
                                    value={tempPrice[product._id.$oid] ?? product.priceTag} 
                                    onChange={(e) => 
                                        setTempPrice({ ...tempPrice, [product._id.$oid]: e.target.value })
                                    }
                                    onBlur={() => {
                                        const price = parseFloat(tempPrice[product._id.$oid]);
                                        if (!isNaN(price) && price !== product.priceTag && price >= 0) {
                                            handleUpdate(product._id.$oid, { priceTag: price });
                                        }else{
                                            alert("Please enter a valid price. Price did not changed.");
                                        }
                                    }}
                                />
                            </p>
                            <p><b>Quantity:</b> 
                                <input 
                                    type="number" 
                                    value={tempQuantity[product._id.$oid] ?? product.quantity} 
                                    onChange={(e) => 
                                        setTempQuantity({ ...tempQuantity, [product._id.$oid]: e.target.value })
                                    }
                                    onBlur={() => {
                                        const quantity = parseFloat(tempQuantity[product._id.$oid]);
                                        if (Number.isInteger(quantity) && quantity !== product.quantity && quantity >= 0) {
                                            handleUpdate(product._id.$oid, { quantity: quantity });
                                        }else{
                                            alert("Please enter a valid quantity. Quantity did not changed.");
                                        }
                                    }}
                                />
                            </p>
                            <button onClick={() => handleDelete(product._id.$oid)} className="deleteBttn">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
