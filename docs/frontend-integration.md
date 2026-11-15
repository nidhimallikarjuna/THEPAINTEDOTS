# Frontend integration checklist

1. Add `VITE_API_BASE_URL=http://localhost:4000` to the frontend `.env` file.
2. Replace the shop page's `INITIAL_PRODUCTS` usage with `GET /api/products`.
3. Add registration/login forms and keep the returned token in a carefully considered session mechanism. For a production app, prefer secure, HttpOnly cookies rather than localStorage.
4. Replace demo cart state with `GET/PUT/DELETE /api/cart` after login. The current API cart format is `{ items: [{ productId: number, quantity: number }] }`; map existing string product IDs to SQL numeric IDs before calling it.
5. In checkout, submit product IDs and quantities, shipping details and payment method to `POST /api/orders`. Never submit a trusted total; the server recalculates it.
6. Fetch order history from `GET /api/orders` and status history from `GET /api/orders/:id`.
7. Add an admin-only dashboard using `GET /api/admin/analytics` and stock/status update endpoints.
8. Keep local demo data available until each screen has been tested against the API, then remove it.

The frontend product IDs (`cst-001`, etc.) are strings while this starter uses auto-increment MySQL numeric IDs and a unique SKU. Map `sku` to the frontend string ID, or change the schema/API consistently if you prefer string IDs end-to-end.
