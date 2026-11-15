1. Count how many times each product was ordered
2. Find products priced above the average price
3. Find products priced above their category average
4. Delete a product from the database
5. Verify that the product was deleted
---------------------------------------------------

USE painted_dots;

SELECT
    p.id,
    p.name AS product_name,
    COUNT(oi.product_id) AS times_ordered
FROM products p
LEFT JOIN order_items oi
    ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY p.id;

USE painted_dots;

SELECT
    id,
    name,
    price
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);

USE painted_dots;

SELECT
    p1.id,
    p1.name,
    p1.category,
    p1.price
FROM products p1
WHERE p1.price > (
    SELECT AVG(p2.price)
    FROM products p2
    WHERE p2.category = p1.category
);

USE painted_dots;

DELETE FROM products
WHERE id = 2;

USE painted_dots;

SELECT id, name
FROM products
WHERE id = 2;