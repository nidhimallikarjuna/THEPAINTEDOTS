1. Display all orders
2. Update the order status
3. Display order status history
4. Display order details with product information



USE painted_dots;

SELECT id, order_number, status
FROM orders;

USE painted_dots;

UPDATE orders
SET status = 'Processing'
WHERE id = 1;

USE painted_dots;

SELECT *
FROM order_status_history
WHERE order_id = 1
ORDER BY changed_at DESC;

USE painted_dots;

SELECT
    o.order_number,
    p.name AS product_name,
    oi.quantity,
    o.status
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;