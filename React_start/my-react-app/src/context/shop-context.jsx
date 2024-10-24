import {createContext, useEffect, useState } from 'react'
import axios from 'axios';
import { getCookie, setCookie } from './cookieHelpers';


export const ShopContext = createContext(null);


const getDefaultCart = () => {          //i changed this function, to remember
    let cart ={};
    return cart;
};


export const ShopContextProvider = (props) => {
//////

    const saveCartToCookies = (cart) => {
        setCookie('cartItems', JSON.stringify(cart), 7); // Save cart in cookies
    };

    const loadCartFromCookies = () => {
        const savedCart = getCookie('cartItems');
        return savedCart ? JSON.parse(savedCart) : null;
    };

    const [cartItems, setCartItems] = useState(() => loadCartFromCookies() || getDefaultCart());

    useEffect(() => {
        const savedCart = loadCartFromCookies();
        if (savedCart) {
            setCartItems(savedCart); // Load cart from cookies on page load
        }
    }, []);
/////

    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
            });
    }, []);


    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for(const item in cartItems){
            if (cartItems[item] > 0) {
                // let itemInfo = products.find((product) => product.id == Number(item));
                let itemInfo = products.find((product) => product._id.$oid === item);
                // totalAmount += cartItems[item] * itemInfo.priceTag;
                // console.log(itemInfo);
                if (itemInfo) {
                    totalAmount += cartItems[item] * itemInfo.priceTag;
                } else {
                    console.warn(`Product with ID ${item} not found in the products list.`);
                }
              }
            
        }

        return totalAmount;
    }

    // const addToCart = (itemId) => {
    //     setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    // }
    const addToCart = (itemId) => {
        setCartItems((prev) => {
            const updatedCart = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
            saveCartToCookies(updatedCart);
            return updatedCart;
        });
    };


    const removeFromCart = (itemId) => {
        setCartItems((prev) => {
            const updatedCart = { ...prev, [itemId]: prev[itemId] > 1 ? prev[itemId] - 1 : 0 };
            saveCartToCookies(updatedCart);
            return updatedCart;
        });
    };

    const updateCartItemCount = (newAmount, itemId) => {
        setCartItems((prev) => {
            const updatedCart = { ...prev, [itemId]: newAmount };
            saveCartToCookies(updatedCart);
            return updatedCart;
        });
    };

    const contextValue = {cartItems, addToCart, removeFromCart, updateCartItemCount, getTotalCartAmount, setCartItems};

    return <ShopContext.Provider value={contextValue}>{props.children}</ShopContext.Provider>;
};





/////

