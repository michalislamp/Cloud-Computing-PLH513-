# e-Taverna

e-Taverna is a fully functional e-commerce web application for an online tavern. The project is deployed on a Virtual Machine (VM) hosted on Google Cloud Platform, utilizing a Dockerized multi-service architecture. VMs IP
(now probably is down) is `http://35.219.242.217:5173`.

## Features

- **Frontend**: Built with React, providing a user-friendly interface.  
  - **Folder**: `my-react-app`  
  - **port**: 5173

- **Backend/API**: Developed using Flask (Python) for secure and efficient API communication.  
  - **Services**:
    - `flask-api`: Handles product-related operations.
    - `OrderService`: Manages order-related operations.
  - **Databases**: MongoDB for `ProductsDB` and `OrdersDB`.

- **Authentication**: Implemented with Keycloak for secure user authentication and role-based access control.  
  - **Admin Panel**: 8182

- **Messaging**: Uses Apache Kafka for pub/sub communication between services.  
  - **Control Center**: 9021

## Disclaimer


To run the application locally ensure tha all IPs `35.219.242.217` is replaced with `localhost`.
Folders to check:
- `my-react-app/src/`
- `my-react-app/Dockerfile`
- `flask-api/newOrders.py`
- `OrderService/orderAPI.py`
- `docker-compose.yml`

Also the keycloack`s sql is not uploaded so you have to set again keycloack.

The application runs entirely on Docker containers orchestrated by Docker Compose.  
To start the application:

```bash
docker-compose up
```

Project's grade 10 / 10.
