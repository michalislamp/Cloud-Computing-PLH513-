import React, { createContext, useState, useEffect } from "react";
import { eraseCookie } from "../context/cookieHelpers";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userRole: null,
    preferredUsername: null,
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const username = localStorage.getItem("preferred_username");
    const role = localStorage.getItem("user_role");

    if (accessToken && refreshToken) {
      setAuthState({
        isLoggedIn: true,
        userRole: role,
        preferredUsername: username,
      });
    }
  }, []);


  // const login = async () => {

  //   window.location.href = "http://localhost:8182/realms/eshop/protocol/openid-connect/auth?response_type=code&client_id=frontend-client&redirect_uri=http://127.0.0.1:5173";

  // }
  const login = () => {
    const authUrl = "http://35.219.242.217:8182/realms/eshop/protocol/openid-connect/auth";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: "frontend-client",
      redirect_uri: "http:35.219.242.217:5173",
    });
    window.location.href = `${authUrl}?${params.toString()}`;
  };

  const handleCallBack = async () => {
    // console.log("login");
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      console.error("Authorization code not found in the URL.");
      return;
    }

    fetch("http://35.219.242.217:8182/realms/eshop/protocol/openid-connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "frontend-client",
        client_secret: "your-client-secret",
        redirect_uri: "http://35.219.242.217:5173",
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

          // navigate("/");
        } else {
          console.error("Access token not found in response.");
        }
      })
      .catch((error) => {
        console.error("Error exchanging code:", error);
      });

  }


  const logout = async () => {
    const keycloakLogoutUrl = "http://35.219.242.217:8182/realms/eshop/protocol/openid-connect/logout";
    const clientId = "frontend-client";
    const refreshToken = localStorage.getItem("refresh_token");
  
    if (!refreshToken) {
      console.error("No refresh token found");
      return;
    }
  
    try {
      // Send a POST request to Keycloak's logout endpoint
      const response = await fetch(keycloakLogoutUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          refresh_token: refreshToken,
        }),
      });
  
      if (response.ok) {
        console.log("Logged out successfully");
  
        // Clear local storage and update auth state
        localStorage.clear();
        setAuthState({
          isLoggedIn: false,
          userRole: null,
          preferredUsername: null,
        });
  
        // Redirect to the home page
        eraseCookie('cartItems');

        window.location.href = "/";
      } else {
        console.error("Failed to log out", await response.text());
      }
    } catch (error) {
      console.error("An error occurred while logging out:", error);
    }
  };
  

  return (
    <AuthContext.Provider value={{ authState, setAuthState, logout, login, handleCallBack}}>
      {children}
    </AuthContext.Provider>
  );
};
