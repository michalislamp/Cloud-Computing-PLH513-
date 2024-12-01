import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { authState, setAuthState } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      console.error("Authorization code not found in the URL.");
      return;
    }

    fetch("http://localhost:8182/realms/eshop/protocol/openid-connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "frontend-client",
        client_secret: "your-client-secret",
        redirect_uri: "http://127.0.0.1:5173",
        code: code,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch token: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.access_token) {
          const decodeJwt = (jwtToken) => {
            const base64Url = jwtToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
            return JSON.parse(jsonPayload);
          };

          const decodedToken = decodeJwt(data.access_token);
          const username = decodedToken.preferred_username || "Guest";

          setAuthState({
            isLoggedIn: true,
            userRole: decodedToken.user_role,
            preferredUsername: username,
          });

          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("preferred_username", username);
          localStorage.setItem("user_role", decodedToken.user_role);

          navigate("/");
        } else {
          console.error("Access token not found in response.");
        }
      })
      .catch((error) => {
        console.error("Error exchanging code:", error);
      });
  }, [navigate, setAuthState]);

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1>
          {authState.preferredUsername
            ? `Welcome ${authState.preferredUsername} to e-Taverna`
            : "Welcome to e-Taverna"}
        </h1>
        <p>Your place to be for the finest products and culinary essentials!</p>
        <button onClick={() => navigate("/products")} className="shop-button">
          Start Shopping
        </button>
      </div>
      <div className="footer">
        <p>
          © {new Date().getFullYear()}{" "}
          <a
            href="https://github.com/michalislamp"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Michalis Lamprakis
          </a>
          . All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;