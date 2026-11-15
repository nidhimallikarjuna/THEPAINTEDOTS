1. Display the stored procedure definition
2. Display the procedure parameters
3. Execute the stored procedure
4. Display the low-stock products view
5. Display monthly sales information
6. Display indexes on the products table
--------------------------------------------------

USE painted_dots;

SHOW CREATE PROCEDURE sp_get_top_products;

USE painted_dots;

SELECT
    PARAMETER_NAME,
    DATA_TYPE
FROM information_schema.parameters
WHERE SPECIFIC_SCHEMA = 'painted_dots'
  AND SPECIFIC_NAME = 'sp_get_top_products'
ORDER BY ORDINAL_POSITION;

USE painted_dots;

CALL sp_get_top_products(5);

USE painted_dots;

SELECT * FROM v_low_stock_products;

USE painted_dots;

SELECT * FROM v_monthly_sales;

USE painted_dots;

SHOW INDEX FROM products;