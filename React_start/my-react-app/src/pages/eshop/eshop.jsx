import React, { useEffect, useContext } from 'react';
import './eshop.css';
import { AuthContext } from "../../context/auth-context";
import { useNavigate } from 'react-router-dom';

export const MainShop = () => {

    const navigate = useNavigate(); // Initialize navigate
    const {handleCallBack, authState} = useContext(AuthContext);

    // useEffect(() => {
    //     const callback = async () => {
    //         await handleAuthCallback("http://127.0.0.1:5173"); // Pass redirect URI
    //     };
    //     callback(); // Call the async wrapper function
    // }, []);
    useEffect(() => {
        handleCallBack();
        navigate("/");
    }, []);

    return (
        <div className="welcome-page">
            <div className="welcome-content">
                <h1>
                {authState.preferredUsername
                    ? `Welcome ${authState.preferredUsername} to e-Taverna`
                    : "Welcome to e-Taverna"}
                </h1>
                <p>Your place to be for the finest products and culinary essentials!</p>
                <button onClick={() => window.location.href = "/products"} className="shop-button">
                    Start Shopping
                </button>
            </div>
            <div className="footer">
                <p>
                    © {new Date().getFullYear()}{' '}
                    <a 
                        href="https://github.com/michalislamp" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        Michalis Lamprakis
                    </a>. All rights reserved.
                </p>
            </div>
        </div>
    );
};

 