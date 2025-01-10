import React, {useContext, useState} from 'react'
import { ShopContext } from "../../context/shop-context";
import "./cart.css";

export const CartItem = (props) => {

    const {_id, productName, priceTag, imageFile, quantity} = props.data
    const productId = _id.$oid; // Use _id.$oid to get the string ID

    const{ cartItems, addToCart, removeFromCart,updateCartItemCount } = useContext(ShopContext);

    const [error, setError] = useState(false);  // State to track if quantity exceeds sto

    // Handle if the quantity exceeds the stock
    const handleQuantityChange = (e) => {
        const newCount = Number(e.target.value);

        if (newCount > quantity) {
            setError(true);  // If newCount exceeds stock, show error
        } else {
            setError(false); // Otherwise, remove error
        }
        updateCartItemCount(newCount, productId);  // Update cart count
    };

    const handleAddToCart = () => {
        const currentCount = cartItems[productId] || 0;
        const newCount = currentCount + 1;

        console.log("add to cart called");

        if (newCount > quantity) {
            setError(true);  // Show error if it exceeds stock
        } else {
            setError(false);  // No error if it's within stock
        }
        addToCart(productId);  // Add to cart only if it doesn't exceed stock
    };

    // Handle decreasing the product quantity when "-" button is clicked
    const handleRemoveFromCart = () => {
        const currentCount = cartItems[productId] || 0;
        const newCount = currentCount - 1;

        if (newCount <= quantity) {
            setError(false);  // Clear error if stock is valid
        }
        removeFromCart(productId);  // Remove from cart
    };

    return (
        <div className="cart-item">
            <img src={imageFile}/>
            <div className="cart-item-details">
                <p>
                    <b>{productName}</b>
                </p>
                <p>
                    {priceTag} €
                </p>
                <div className="cart-item-controls">
                    <button onClick={() => handleRemoveFromCart()}> - </button>
                    <input value={cartItems[productId] || 0} onChange={ (e) => handleQuantityChange(e) } />
                    <button onClick={() => handleAddToCart()}> + </button>
                </div>
            </div>
        </div>
    )
}
