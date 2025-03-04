import React from 'react';
import "./shop.css";
import {Product} from "./product";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


axios.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


export const Shop = () => {

    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');  // State for the search input

    const navigate = useNavigate();
    useEffect(() => {
        const role = localStorage.getItem("user_role");
        if (role === "seller") {
          navigate("/"); // Redirect to homepage if user is a sller.
        }
        axios.get('http://35.219.242.217:8080/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
            });
    }, []);

    const filteredProducts = products.filter((product) =>
        product.productName.toLowerCase().startsWith(searchQuery.toLowerCase())
    );

    

    return(
    
        <div className="shop">
            <div className="header">
                <div className="shopTitle">
                    <h1>MENU</h1>
                </div>
                {/* Search bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}  // Update the search query state
                    />
                </div>
            </div>
            <div className="product-container">
                <div className="products">

                {filteredProducts.map((product)  => (                       //for each product in the products arrat, perform
                    <Product key={product._id.$oid} data={product}/>       //perform Product component with the data of the product.
                ))}

                </div>
            </div>
        </div>

    );

};
