import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "phosphor-react";
import "./navbar.css";
import { AuthContext } from "../context/auth-context";

export const Navbar = () => {
  const { authState, logout } = useContext(AuthContext);

  return (
    <div className="navbar">
      <div className="links">
        <Link to="/">
          <img src="/logo.png" alt="Logo" className="logo" />
        </Link>

        {!authState.isLoggedIn && (
          <>
            <Link to="/products">Products</Link>
            <Link to="/cart">
              <ShoppingCart size={32} />
            </Link>
          </>
        )}
        {authState.isLoggedIn && authState.userRole === "customer" && (
          <>
            <Link to="/products">Products</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/cart">
              <ShoppingCart size={32} />
            </Link>
          </>
        )}
        {authState.isLoggedIn && authState.userRole === "seller" && (
          <>
            <Link to="/myProducts">MyProducts</Link>
          </>
        )}
        {!authState.isLoggedIn ? (
          <a
            href="http://localhost:8182/realms/eshop/protocol/openid-connect/auth?response_type=code&client_id=frontend-client&redirect_uri=http://127.0.0.1:5173"
            className="login-button"
          >
            Login
          </a>
        ) : (
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        )}
      </div>
    </div>
  );
};
