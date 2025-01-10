// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './orders.css';
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../../context/auth-context";


// export const Orders = () => {
//     const [orders, setOrders] = useState([]);
//     const navigate = useNavigate();
//     const { authState } = useContext(AuthContext);

//     useEffect(() => {

//         const role = localStorage.getItem("user_role");
//         if (role !== "customer") {
//           navigate("/"); // Redirect to homepage if user is a sller.
//         }

//         axios.get('http://localhost:8081/orders')
//             .then(response => {
//                 setOrders(response.data);
//             })
//             .catch(error => {
//                 console.error('There was an error fetching the orders!', error);
//             });
//     }, []);

//     return (
//         <>
//         <div className="header">
//                 <h1>Orders</h1>
//         </div>
//         <div className="orders-container">            
//             {orders.length > 0 ? (
//                 orders.map((order, index) => (
//                     <div key={order._id.$oid} className="order">
//                         <h2>Order {index + 1}</h2>
//                         <h3>Order ID: {order._id.$oid}</h3>
//                         <p className="order-status"> Customer: {order.user_name}</p>
//                         <p className="order-status">Status: {order.status}</p>
//                         <p className="order-total">Total Price: {order.total}€</p>
                        
//                         <h4>Products:</h4>
//                         <ul>
//                             {order.items.map((product, productIndex) => (
//                                 <li key={productIndex}>
//                                     <strong>Title:</strong> {product.productName} <br />
//                                     <strong>Amount:</strong> {product.quantity} <br />
//                                     <strong>Product ID:</strong> {product.product_id}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 ))
//             ) : (
//                 <p>No orders found.</p>
//             )}
//         </div>
        
//     </>    
//     );
// };

// export default Orders;

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './orders.css';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";

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

export const Orders = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const { authState } = useContext(AuthContext);

    useEffect(() => {
        const role = localStorage.getItem("user_role");
        if (role !== "customer") {
            navigate("/"); // Redirect to homepage if user is not a customer.
        }

        axios.get('http://35.219.242.217:8081/orders')
            .then(response => {
                // Filter orders for the logged-in user
                const userOrders = response.data.filter(
                    order => order.user_name === authState.preferredUsername
                );
                setOrders(userOrders);
            })
            .catch(error => {
                console.error('There was an error fetching the orders!', error);
            });
    }, [authState.preferredUsername, navigate]);

    return (
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
                            <p className="order-status">Customer: {order.user_name}</p>
                            <p className="order-status">Status: {order.status}</p>
                            <p className="order-total">Total Price: {order.total}€</p>
                            
                            <h4>Products:</h4>
                            <ul>
                                {order.items.map((product, productIndex) => (
                                    <li key={productIndex}>
                                        <strong>Title:</strong> {product.productName} <br />
                                        <strong>Amount:</strong> {product.quantity} <br />
                                        <strong>Product ID:</strong> {product.product_id}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>No orders found for your account.</p>
                )}
            </div>
        </>
    );
};

export default Orders;

