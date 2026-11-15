1. Display all database tables and views
2. Display stored procedures
3. Display database triggers
4. Display the stored procedure definition
5. Display stored procedure parameters
6. Execute the stored procedure
7. Display product inventory
8. Display product table structure
--------------------------------------------------------

USE painted_dots;

SELECT
    TABLE_NAME,
    TABLE_TYPE
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'painted_dots'
ORDER BY TABLE_TYPE, TABLE_NAME;

USE painted_dots;

SHOW PROCEDURE STATUS
WHERE Db = 'painted_dots';

SHOW TRIGGERS FROM painted_dots;

SHOW CREATE PROCEDURE painted_dots.sp_get_top_products;

USE painted_dots;

SELECT
    PARAMETER_NAME,
    DATA_TYPE,
    PARAMETER_MODE
FROM information_schema.PARAMETERS
WHERE SPECIFIC_SCHEMA = 'painted_dots'
  AND SPECIFIC_NAME = 'sp_get_top_products'
ORDER BY ORDINAL_POSITION;
CALL sp_get_top_products(5);

USE painted_dots;

SELECT id, name, stock_quantity
FROM products;

DESCRIBE painted_dots.products;