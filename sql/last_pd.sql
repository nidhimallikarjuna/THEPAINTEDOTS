1. Display all foreign key relationships
2. Check products table constraints
3. Check orders table constraints
4. Check order_items table constraints
5. Check reviews table constraints
6. Check addresses table constraints
7. Check users table constraints
-----------------------------------------------

USE painted_dots;

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'painted_dots'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
--------------------------------------
USE painted_dots;

SELECT
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'painted_dots'
  AND TABLE_NAME = 'products';
  --------------------------
  
USE painted_dots;

SELECT
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'painted_dots'
  AND TABLE_NAME = 'orders';
--------------------------------------------
USE painted_dots;

SELECT
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'painted_dots'
  AND TABLE_NAME = 'order_items';
-----------------------------------
USE painted_dots;

SELECT
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'painted_dots'
  AND TABLE_NAME = 'reviews';
--------------------------------------
USE painted_dots;

SELECT
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'painted_dots'
  AND TABLE_NAME = 'addresses';
------------------------------------------------
USE painted_dots;

SELECT
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'painted_dots'
  AND TABLE_NAME = 'users';