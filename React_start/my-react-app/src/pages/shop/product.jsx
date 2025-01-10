import React, {useContext} from 'react';
import { ShopContext } from "../../context/shop-context";



export const Product = (props) => {

    const {_id, productName, priceTag, imageFile, quantity} = props.data   //changed id
    const productId = _id.$oid; // Use _id.$oid to get the string ID

    const{ addToCart, cartItems } = useContext(ShopContext);
    // const cartItemAmmount = cartItems[id];
    const cartItemAmount = (cartItems[productId] || 0); // Default to 0 if the item isn't in the cart yet

    return( 
        <div className="product"> 
            <img src={imageFile}/>
            <div className="description">
                <p>
                    <b>{productName}</b>
                </p>
                <p>
                    {priceTag} €
                </p>
            </div>
            {/* Disable the button if quantity is 0 */}
            <button
                className="addToCartBttn"
                onClick={() => addToCart(productId)}
            >
                Add To Cart {cartItemAmount > 0 ? `(${cartItemAmount})` : ''}
            </button>
        </div>
    );
};


