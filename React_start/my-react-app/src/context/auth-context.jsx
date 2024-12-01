import React, { createContext, useState, useEffect } from "react";

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

  const logout = async () => {
    const keycloakLogoutUrl = "http://localhost:8182/realms/eshop/protocol/openid-connect/logout";
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
        window.location.href = "/";
      } else {
        console.error("Failed to log out", await response.text());
      }
    } catch (error) {
      console.error("An error occurred while logging out:", error);
    }
  };
  

  return (
    <AuthContext.Provider value={{ authState, setAuthState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
