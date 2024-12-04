# Dockerfile for products-service

# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# Apache Kafka Service
RUN pip install confluent-kafka

# Make port 8081 available to the world outside this container
EXPOSE 8081

# Define environment variable
ENV FLASK_APP=app/orderAPI.py

# Run orderAPI.py when the container launches
# CMD ["flask", "run", "--host=0.0.0.0", "--port=8081"]
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=8081"]
