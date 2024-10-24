// import React, { useState } from 'react';
// import axios from 'axios';
// import "./myProducts.css";

// export const MyProducts = () => {
//     // State to hold form inputs
//     const [productName, setProductName] = useState("");
//     const [price, setPrice] = useState("");
//     const [imageUrl, setImageUrl] = useState("");
//     const [quantity,setQuantity] = useState("");

//     // Function to handle form submission
//     const handleSubmit = (e) => {
//         e.preventDefault(); // Prevent page reload on form submission

//         // Create a product object
//         const newProduct = {
//             productName,
//             priceTag: parseFloat(price),  // Ensure price is a number
//             productImage: imageUrl,
//             quantity,

//         };

//         // Send POST request to your API to save the new product
//         axios.post('http://localhost:8080/products', newProduct)
//             .then((response) => {
//                 console.log('Product added successfully:', response.data);
//                 // Optionally reset the form inputs after successful submission
//                 setProductName("");
//                 setPrice("");
//                 setImageUrl("");
//                 setQuantity("");
//             })
//             .catch((error) => {
//                 console.error('There was an error adding the product!', error);
//             });
//     };

//     return (
//         <div>
//             <div className='myProductsTitle'>
//                 <h1>Add New Product</h1>
//             </div>
//             <form onSubmit={handleSubmit}>
//                 <div className='productForm'>
//                     <label>Product Name:</label>
//                     <input 
//                         type="text" 
//                         value={productName} 
//                         onChange={(e) => setProductName(e.target.value)} 
//                         required 
//                     />
//                 </div>
//                 <div className='productForm'>
//                     <label>Price:</label>
//                     <input 
//                         type="number" 
//                         value={price} 
//                         onChange={(e) => setPrice(e.target.value)} 
//                         required 
//                     />
//                 </div>
//                 <div className='productForm'>
//                     <label>Image URL:</label>
//                     <input 
//                         type="text" 
//                         value={imageUrl} 
//                         onChange={(e) => setImageUrl(e.target.value)} 
//                         required 
//                     />
//                 </div>
//                 <div className='productForm'>
//                     <label>Quantity:</label>
//                     <input 
//                         type="text" 
//                         value={quantity} 
//                         onChange={(e) => setQuantity(e.target.value)} 
//                         required 
//                     />
//                 </div>
//                 <div className='buttonContainer'>
//                 <button className='addProductBttn' type="submit">Add Product</button>
//                 </div>
//             </form>
//         </div>
//     );
// };
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./myProducts.css";

export const MyProducts = () => {
    // State to hold form inputs for adding a product
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [quantity, setQuantity] = useState("");
    
    // State to hold the list of products from the database
    const [products, setProducts] = useState([]);

    // Function to handle form submission for adding a new product
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload on form submission

        // Create a product object
        const newProduct = {
            productName,
            priceTag: parseFloat(price),  // Ensure price is a number
            productImage: imageUrl,
            quantity: parseInt(quantity), // Ensure quantity is an integer
        };

        // Send POST request to your API to save the new product
        axios.post('http://localhost:8080/products', newProduct)
            .then((response) => {
                console.log('Product added successfully:', response.data);
                // Optionally reset the form inputs after successful submission
                setProductName("");
                setPrice("");
                setImageUrl("");
                setQuantity("");
                fetchProducts(); // Fetch updated products list
            })
            .catch((error) => {
                console.error('There was an error adding the product!', error);
            });
    };

    // Function to fetch all products from the backend
    const fetchProducts = () => {
        axios.get('http://localhost:8080/products')
            .then((response) => {
                setProducts(response.data); // Set the fetched products in state
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
            });
    };

    // Call fetchProducts on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Function to handle updating product price or quantity
    const handleUpdate = (productId, updatedField) => {
        axios.put(`http://localhost:8080/products/${productId}`, updatedField)
            .then((response) => {
                console.log('Product updated successfully:', response.data);
                fetchProducts(); // Fetch updated products list
            })
            .catch((error) => {
                console.error('Error updating product:', error);
            });
    };

    const handleDelete = (productId) => {
        axios.delete(`http://localhost:8080/products?_id=${productId}`)
            .then((response) => {
                console.log('Product deleted successfully:', response.data);
                fetchProducts(); // Fetch updated products list
            })
            .catch((error) => {
                console.error('Error deleting product:', error);
            });
    };

    return (
        <div>
            <div className='myProductsTitle'>
                <h1>Add New Product</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <div className='productForm'>
                    <label>Product Name:</label>
                    <input 
                        type="text" 
                        value={productName} 
                        onChange={(e) => setProductName(e.target.value)} 
                        required 
                    />
                </div>
                <div className='productForm'>
                    <label>Price:</label>
                    <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        required 
                    />
                </div>
                <div className='productForm'>
                    <label>Image URL:</label>
                    <input 
                        type="text" 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)} 
                        required 
                    />
                </div>
                <div className='productForm'>
                    <label>Quantity:</label>
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        required 
                    />
                </div>
                <div className='buttonContainer'>
                <button className='addProductBttn' type="submit">Add Product</button>
                </div>
            </form>

            <div className='productList'>
                <h2>Update or Delete Products</h2>
                {products.map((product) => (
                    <div key={product._id.$oid} className="productItem">
                        <img src={product.productImage} alt={product.productName} />
                        <div>
                            <p><b>Name:</b> {product.productName}</p>
                            <p><b>Price:</b> 
                                <input 
                                    type="number" 
                                    value={product.priceTag} 
                                    onChange={(e) => 
                                        handleUpdate(product._id.$oid, { priceTag: parseFloat(e.target.value) })
                                    }
                                />
                            </p>
                            <p><b>Quantity:</b> 
                                <input 
                                    type="number" 
                                    value={product.quantity} 
                                    onChange={(e) => 
                                        handleUpdate(product._id.$oid, { quantity: parseInt(e.target.value) })
                                    }
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
