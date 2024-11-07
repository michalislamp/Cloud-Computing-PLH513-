# Commercial e-Shop

This project contains a React front-end and two back-end APIs built using Flask. Follow the steps below to get everything up and running.

## Requirements

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (for running the React app)
- [Python](https://www.python.org/) (for running the Flask APIs)
- [Virtualenv](https://pypi.org/project/virtualenv/) (for managing Python environments)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for hosting Docker Containers locally)

## Project Setup (Docker Containers)

1. Navigate to the React project directory:
    ```bash
    cd React_start/
    ```
2. Build Docker:
    ```bash
    docker compose up
    ```
The app will run in `http://localhost:5173/`

## Project Setup (Locally)

### 1. Running the React App

1. Navigate to the React project directory:
    ```bash
    cd React_start/my-react-app
    ```

2. Install the required dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

   The React app will start and will be available at [http://localhost:5173](http://localhost:5173).

### 2. Running the Flask APIs

You will need to run two separate Flask APIs.

#### 2.1 First API

1. Navigate to the `flask-api` directory:
    ```bash
    cd flask-api
    ```

2. Activate the Python virtual environment:
    - On Windows:
      ```bash
      myvenv\Scripts\activate
      ```

3. Run the first Flask API:
    ```bash
    py app/newAPI.py
    ```

   The first API will run, typically available at [http://localhost:27017](http://localhost:27017).

#### 2.2 Second API

1. Navigate to the `OrderService` directory:
    ```bash
    cd OrderService
    ```

2. Activate the Python virtual environment:
    - On Windows:
      ```bash
      .venv\Scripts\activate
      ```

3. Run the second Flask API:
    ```bash
    py app/orderAPI.py
    ```

   The second API will run, typically available at [http://localhost:27018](http://localhost:27018).

### 3. Final Notes

- Ensure that both APIs are running at the same time since the React app depends on them.
- Check the terminal or console for any errors during setup or runtime.

## Troubleshooting

- **React App**: If the app fails to start, ensure all dependencies are installed by running `npm install` in the React app directory. Check the terminal for error messages.
- **Flask APIs**: Ensure the virtual environment is activated before running the APIs. Check for any Python-related issues if the APIs fail to start.

That's it! You should now have both the React app and the Flask APIs up and running.
