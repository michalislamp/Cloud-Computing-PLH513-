// import React, { useContext } from "react";
// import { Link } from "react-router-dom";
// import { ShoppingCart } from "phosphor-react";
// import "./navbar.css";
// import { AuthContext } from "../context/auth-context";

// export const Navbar = () => {
//   const { authState, logout, login } = useContext(AuthContext);

//   return (
//     <div className="navbar">
//       <div className="links">
//         <Link to="/">
//           <img src="/logo.png" alt="Logo" className="logo" />
//         </Link>

//         {!authState.isLoggedIn && (
//           <>
//             <Link to="/products">Products</Link>
//             <Link to="/cart">
//               <ShoppingCart size={32} />
//             </Link>
//           </>
//         )}
//         {authState.isLoggedIn && authState.userRole === "customer" && (
//           <>
//             <Link to="/products">Products</Link>
//             <Link to="/orders">Orders</Link>
//             <Link to="/cart">
//               <ShoppingCart size={32} />
//             </Link>
//           </>
//         )}
//         {authState.isLoggedIn && authState.userRole === "seller" && (
//           <>
//             <Link to="/myProducts">MyProducts</Link>
//           </>
//         )}
//         {!authState.isLoggedIn ? (
//           <button onClick={login} className="logout-button">
//           Login
//           </button>
//         ) : (
//           <button onClick={logout} className="logout-button">
//             Logout
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "phosphor-react";
import "./navbar.css";
import { AuthContext } from "../context/auth-context";

export const Navbar = () => {
  const { authState, logout, login } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    setIsMenuOpen(false);
  };

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
          <button onClick={login} className="auth-button">
            Login
          </button>
        ) : (
          <div
            className="user-menu"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span className="username">{authState.preferredUsername}</span>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button onClick={logout} className="logout-button">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
