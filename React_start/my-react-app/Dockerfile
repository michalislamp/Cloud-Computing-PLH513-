# Use Node.js Alpine as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy all other app files to the container
COPY . .

# Ensure environment variables are passed at build time
ARG REACT_APP_API_URL
ARG REACT_APP_API_KEY

# Build the React app
RUN npm run build

# Expose the port for Vite (React development server)
EXPOSE 5173

# Start the React app in development mode
CMD ["npm", "run", "dev"]


# FOR GOOGLE CLOUD

# FROM node:18.19.1-alpine

# # Set the working directory
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install system dependencies (for Alpine)
# RUN apk add --no-cache bash python3 make g++

# # Cleanly install dependencies
# RUN npm ci

# # Copy the rest of the application
# COPY . .

# # Ensure all files have proper permissions
# RUN chmod -R 755 /app

# # Build the application
# RUN npm run build

# # Expose the development server port
# EXPOSE 5173

# # Start the React app
# CMD ["npm", "run", "dev"]