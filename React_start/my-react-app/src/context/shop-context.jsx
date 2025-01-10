import {createContext, useEffect, useState, useContext } from 'react'
import axios from 'axios';
import { getCookie, setCookie } from './cookieHelpers';
import { AuthContext } from './auth-context';

axios.interceptors.request.use(

    async (config) => {
        let token = localStorage.getItem("access_token");
        console.log("Token from localStorage:", token);
        if (!token) {
            console.warn("No token found. You may need to log in.");
            return config;
    }
        // Set the Authorization header
        config.headers["Authorization"] = `Bearer ${token}`;
        console.log("Request Headers with Authorization:", config.headers); // Debug log
        return config;
    },
    (error) => {
    return Promise.reject(error);
}
);


export const ShopContext = createContext(null);


const getDefaultCart = () => {          //i changed this function, to remember
    let cart ={};
    return cart;
};


export const ShopContextProvider = (props) => {
//////

    const { authState } = useContext(AuthContext);

    const saveCartToCookies = (cart) => {
        setCookie('cartItems', JSON.stringify(cart), 7); // Save cart in cookies
    };

    const loadCartFromCookies = () => {
        const savedCart = getCookie('cartItems');
        return savedCart ? JSON.parse(savedCart) : null;
    };

  
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get('http://35.219.242.217:8080/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
            });
    }, []);

    const [cartItems, setCartItems] = useState(() => loadCartFromCookies() || getDefaultCart());
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const savedCart = loadCartFromCookies();
        if (savedCart) {
            setCartItems(savedCart); // Load cart from cookies on page load
        }
    }, []);
/////

    const getTotalCartAmount = () => {

        getReq();  //get the products.

        console.log("products: ", products);
        let totalAmount = 0;
        for(const item in cartItems){
            if (cartItems[item] > 0) {
                // let itemInfo = products.find((product) => product.id == Number(item));
                let itemInfo = products.find((product) => product._id.$oid === item);
                // totalAmount += cartItems[item] * itemInfo.priceTag;
                if (itemInfo) {
                    totalAmount += cartItems[item] * itemInfo.priceTag;
                } else {
                    console.warn(`Product with ID ${item} not found in the products list.`);
                }
              }
            
        }
        
        setTotalPrice(totalAmount);
        return totalAmount;
    }

    // const addToCart = (itemId) => {
    //     setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    // }
    const addToCart = (itemId) => {

        if(!authState.isLoggedIn){
            alert("Please login to add item to Cart.");
            return;
        }
        
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

    const getReq = () => {

        useEffect(() => {
            axios.get('http://35.219.242.217:8080/products')
                .then(response => {
                    setProducts(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the products!', error);
                });
        }, []);

    };

    const contextValue = {cartItems, addToCart, removeFromCart, updateCartItemCount, getTotalCartAmount, setCartItems, getReq,totalPrice};

    return <ShopContext.Provider value={contextValue}>{props.children}</ShopContext.Provider>;
};





/////

