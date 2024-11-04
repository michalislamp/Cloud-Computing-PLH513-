// import React from 'react'
// import './eshop.css'

// export const MainShop = () => {
//     return (
//         <div className="footer">
//         <p>
//             © {new Date().getFullYear()}{' '}
//             <a 
//             href="https://github.com/michalislamp" 
//             target="_blank" 
//             rel="noopener noreferrer"
//             className="footer-link"
//             >
//             Michalis Lamprakis
//             </a>. All rights reserved.
//         </p>
//         </div>
//     );
//     };

import React from 'react';
import './eshop.css';

export const MainShop = () => {
    return (
        <div className="welcome-page">
            <div className="welcome-content">
                <h1>Welcome to e-Taverna</h1>
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

 