import React, {useContext, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from "../../context/shop-context";
import {CartItem} from './cart-item';
import "./cart.css";
import axios from 'axios';
import { eraseCookie } from "../../context/cookieHelpers";
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


export const Cart = () => {

    const { authState } = useContext(AuthContext);

    const{ cartItems, setCartItems, getTotalCartAmount } = useContext(ShopContext);
    const totalAmount = getTotalCartAmount();

    const [products, setProducts] = useState([]);
    const [isCheckoutDisabled, setIsCheckoutDisabled] = useState(false);

    const { totalPrice } = useContext(ShopContext);  //new

    const navigate = useNavigate(); // Initialize navigate

    const handleCheckout = async () => {
        const checkoutPromises = [];
        const failedItems = [];
        const orderProducts = [];  // To store product details for the order
        const totalAmount = totalPrice;  // Total price of the order

        
        // for (const itemId in cartItems){
        
        //     if((cartItems[itemId]===0)){
        //         console.log("cartItems[itemId]===0");
        //         alert("Could not checkout.");
        //         return;
        //     }
        // }
        // if(!authState.isLoggedIn){
        //     alert("Please login to checkout.");
        //     return;
        // }

        if(isCheckoutDisabled){
                alert("Could not checkout.");
                return;
            }

        try {
            // Create a lookup for product data to avoid `find` in each iteration
            const productLookup = products.reduce((acc, product) => {
                acc[product._id.$oid] = product;
                return acc;
            }, {});
    
            // Process each item in the cart
            for (const itemId in cartItems) {
                if(cartItems[itemId]===0){
                    alert("Could not checkout.");
                    return;                
                }
                if (cartItems[itemId] > 0) {
                    const product = productLookup[itemId];
    
                    if (product) {
                        // const updatedQuantity = product.quantity - cartItems[itemId];
                        const updatedQuantity =1;
                        
                        if (updatedQuantity >= 0) {
                            // Save the product details to be sent with the order
                            orderProducts.push({
                                title: product.productName,
                                amount: cartItems[itemId],
                                product_id: product._id.$oid,
                                price: product.priceTag
                            });
    
                            // // Add axios promise to array to update the product quantities
                            // const requestPromise = axios.put(`http://localhost:8080/products/${product._id.$oid}`, {
                            //     quantity: updatedQuantity,
                            // }).catch(error => {
                            //     console.error(`Error updating ${product.productName}:`, error);
                            //     failedItems.push(product.productName);  // Track failures
                            // });
    
                            // checkoutPromises.push(requestPromise);
                        } else {
                            console.warn(`Insufficient stock for ${product.productName}`);
                            failedItems.push(product.productName);  // Track insufficient stock
                        }
                    }
                }
            }
    
            // Wait for all product update requests to complete
            // await Promise.all(checkoutPromises);
    
            if (failedItems.length > 0) {
                console.warn('Some items could not be checked out:', failedItems);
                alert(`Checkout failed for: ${failedItems.join(', ')}`);
                return;  // Don't proceed with the order if there were failures
            }
    
            // Prepare order object to be saved in the orders database
            const newOrder = {
                products: orderProducts,       // Array of purchased products
                // total_price: totalAmount,      // Total price of the order
                username: authState.preferredUsername
                // status: "Pending"              // Initial status as "Pending"s
            };
            
            console.log('Order to be saved:', newOrder);

            // Send the order to the orders database
            await axios.post('http://35.219.242.217:8081/orders', newOrder)
                .then((response) => {
                    console.log('Order saved successfully:', response.data);
                    alert('Checkout complete! Your order has been placed.');
                })
                .catch((error) => {
                    console.error('Error saving the order:', error);
                    alert('An error occurred while saving the order.');
                });
    
            // Clear cart and cookies after successful order placement
            setCartItems({});
            eraseCookie('cartItems');
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('An error occurred during checkout.');
        }
    };
    

    useEffect(() => {
        axios.get('http://35.219.242.217:8080/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
            });
    }, []);

    useEffect(() => {
        console.log(isCheckoutDisabled);
        // Check if cartItems is empty (no products added to the cart)
        const isCartEmpty = Object.keys(cartItems).length === 0;
        
        // const disableCheckout = products.some((product) => {
        //     const productId = product._id.$oid;
        //     const cartQuantity = cartItems[productId] || 0;
        //     return cartQuantity > product.quantity; // If cart quantity exceeds stock quantity
        // });

        // setIsCheckoutDisabled(disableCheckout || isCartEmpty);  // Disable checkout if any item is invalid
        setIsCheckoutDisabled(isCartEmpty); 
    }, [cartItems, products]);  // Re-run the check when cartItems or products change


    return (
    <div className="wrapper">
        <div className="cart">
            <div><h1> Your Cart Items </h1></div>
        
            <div className="cart">
            {/* Only show products that are in the cart (i.e., cartItems[productId] > 0)  */}
            {products
                .filter((product) => cartItems[product._id.$oid] > 0) // Filter out products with a quantity of 0
                .map((product) => {
                    const productId = product._id.$oid;
                    // console.log(cartItems[productId]);
                    return <CartItem key={productId} data={product} />;
                    
                })}
            </div>

            <div className="checkout">
                <p> Total: {totalAmount}€ </p>
                <button onClick={() =>  {console.log("Navigating to /products"); navigate('/products');}}>Continue Shopping</button>
                <button onClick={() => handleCheckout()} > Checkout </button>
                {/* {isCheckoutDisabled && <p className="erroCheckout">Could Not Checkout</p>}   */}
            </div>
            
        </div>
    </div>
    );
};
