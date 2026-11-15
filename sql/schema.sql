1. Create the database
2. Create the users table
3. Create the products table
4. Create the orders table
5. Create the order_items table
6. Create the order_status_history table
7. Create the reviews table
8. Create the order status trigger
9. Create the monthly sales view
10. Create the low-stock products view
11. Create the top products stored procedure
12. Display the latest orders
13. Display order items for order ID 1
14. Display product inventory for product ID 3
-------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS painted_dots CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE painted_dots;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url VARCHAR(1000),
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  material VARCHAR(200),
  design_style VARCHAR(80),
  tags TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_stock CHECK (stock_quantity >= 0),
  INDEX idx_products_category (category),
  INDEX idx_products_active_created (is_active, created_at),
  FULLTEXT INDEX ft_products_search (name, description, tags)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(60) NOT NULL UNIQUE,
  user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('Order Placed','Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Order Placed',
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('UPI','Card','Net Banking','COD') NOT NULL DEFAULT 'COD',
  shipping_name VARCHAR(120) NOT NULL,
  shipping_phone VARCHAR(25) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_pincode VARCHAR(12) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT chk_order_amounts CHECK (subtotal >= 0 AND discount_amount >= 0 AND shipping_amount >= 0 AND total_amount >= 0),
  INDEX idx_orders_user_created (user_id, created_at),
  INDEX idx_orders_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name_snapshot VARCHAR(200) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT chk_item_quantity CHECK (quantity > 0),
  CONSTRAINT chk_item_price CHECK (unit_price >= 0),
  INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  old_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_history_order_changed (order_id, changed_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  title VARCHAR(150),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
  UNIQUE KEY uq_review_user_product (user_id, product_id)
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER trg_order_status_history
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
END$$
DELIMITER ;

CREATE OR REPLACE VIEW v_monthly_sales AS
SELECT DATE_FORMAT(created_at, '%Y-%m') AS sales_month,
       COUNT(*) AS order_count,
       SUM(CASE WHEN status <> 'Cancelled' THEN total_amount ELSE 0 END) AS gross_sales
FROM orders
GROUP BY DATE_FORMAT(created_at, '%Y-%m');

CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT id, sku, name, category, stock_quantity
FROM products WHERE is_active = TRUE AND stock_quantity <= 5;

DELIMITER $$
CREATE PROCEDURE sp_get_top_products(IN p_limit INT)
BEGIN
  SELECT oi.product_id, oi.product_name_snapshot AS product_name,
         SUM(oi.quantity) AS units_sold,
         SUM(oi.quantity * oi.unit_price) AS sales_value
  FROM order_items oi JOIN orders o ON o.id = oi.order_id
  WHERE o.status <> 'Cancelled'
  GROUP BY oi.product_id, oi.product_name_snapshot
  ORDER BY units_sold DESC
  LIMIT p_limit;
END$$
DELIMITER ;



USE painted_dots;

SELECT *
FROM orders
ORDER BY id DESC
LIMIT 5;

USE painted_dots;

SELECT *
FROM order_items
WHERE order_id = 1;

USE painted_dots;

SELECT
    id,
    sku,
    name,
    stock_quantity
FROM products
WHERE id = 3;