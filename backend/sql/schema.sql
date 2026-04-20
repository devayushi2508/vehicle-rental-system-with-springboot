CREATE DATABASE IF NOT EXISTS rentalsysdb;
USE rentalsysdb;

CREATE TABLE vehicles (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price_per_day DOUBLE,
    isAvailable BOOLEAN
);

CREATE TABLE customer (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE rentals (
    rental_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    customer_id INT,
    days INT,
    total_cost DOUBLE,
    returned BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);