import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './orders.css';

export const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8081/orders')
            .then(response => {
                setOrders(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the orders!', error);
            });
    }, []);

    return (
        // <div className="orders-header">
        //     <h1>Orders</h1>
        // </div>
        <>
        <div className="header">
                <h1>Orders</h1>
        </div>
        <div className="orders-container">            
            {orders.length > 0 ? (
                orders.map((order, index) => (
                    <div key={order._id.$oid} className="order">
                        <h2>Order {index + 1}</h2>
                        <h3>Order ID: {order._id.$oid}</h3>
                        <p className="order-status">Status: {order.status}</p>
                        <p className="order-total">Total Price: {order.total_price}€</p>

                        <h4>Products:</h4>
                        <ul>
                            {order.products.map((product, productIndex) => (
                                <li key={productIndex}>
                                    <strong>Title:</strong> {product.title} <br />
                                    <strong>Amount:</strong> {product.amount} <br />
                                    <strong>Product ID:</strong> {product.product_id}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
        </div>
        
    </>    
    );
};

export default Orders;
