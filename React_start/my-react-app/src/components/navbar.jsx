import React from 'react';
import { Link } from "react-router-dom";
import { ShoppingCart } from 'phosphor-react';
import "./navbar.css";

export const Navbar = () => {


    return (
        <div className="navbar">
            <div className="links">
                <Link to="/">
                    <img src="/logo.png" alt="Logo" className="logo" />        
                </Link>
                <Link to="/">
                    e-Taverna
                </Link>
                <Link to="/products"> Products </Link>
                <Link to="/myProducts"> MyProducts </Link>
                <Link to="/orders"> Orders </Link>
                <Link to="/cart">
                    <ShoppingCart size={32} />
                </Link>
            </div>
        </div>
    );
};
