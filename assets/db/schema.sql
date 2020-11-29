-- Drop if this database exists
DROP DATABASE IF EXIST cms;

-- Creates the database
CREATE DATABASE cms;

-- Ensure that all code will go to this database
USE cms;

-- Create department table
CREATE TABLE department(
  department_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL
);

-- Create role table
CREATE TABLE role(
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(9,2),
  department_id INT
);

-- Create employee table
CREATE TABLE employee(
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  manager_id INT
);

