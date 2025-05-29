-- create the database
CREATE DATABASE IF NOT EXISTS inventory;
USE inventory;

-- suppliers
CREATE TABLE suppliers (
  supplier_id   INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  contact_info  VARCHAR(255)
);

-- products
CREATE TABLE products (
  product_id   INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  sku          VARCHAR(100) NOT NULL UNIQUE,
  quantity     INT NOT NULL DEFAULT 0,
  supplier_id  INT,
  category     VARCHAR(100),
  price        DECIMAL(10,2),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- orders (incoming/outgoing)
CREATE TABLE orders (
  order_id    INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  order_date  DATETIME DEFAULT CURRENT_TIMESTAMP,
  order_type  ENUM('incoming','outgoing') NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- detailed stock movements
CREATE TABLE stock_movements (
  movement_id      INT AUTO_INCREMENT PRIMARY KEY,
  product_id       INT NOT NULL,
  quantity_change  INT NOT NULL,
  movement_date    DATETIME DEFAULT CURRENT_TIMESTAMP,
  reason           VARCHAR(255),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

