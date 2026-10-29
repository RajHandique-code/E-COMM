# Full-Stack E-Commerce Web Application

React + Vite, Node.js + Express, MongoDB (Mongoose), JWT authentication with role-based access.

Customer side: browse, search, filter by category and price, sort, paginate, product detail, cart, checkout, order history.
Admin side: add, edit and delete products, view all orders, update order status (cancelling restores stock).

## Run locally

Requires Node 20+ and a MongoDB connection (Atlas or local).

Backend
```
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

`npm run seed` creates the admin account (from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`) and 12 sample products.

Frontend (new terminal)
```
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open http://localhost:5174. Sign in as the admin to manage products and orders, or register a normal account to shop.

## API

Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
Products: GET /api/products (q, category, minPrice, maxPrice, sort, page, limit), GET /api/products/categories, GET /api/products/:id, POST, PUT, DELETE (admin)
Orders: POST /api/orders, GET /api/orders/mine, GET /api/orders (admin), PATCH /api/orders/:id/status (admin)

## Deploy

1. Atlas: allow access from anywhere under Network Access and copy the connection string.
2. Push to GitHub.
3. Render web service, root `backend`, build `npm install`, start `npm start`. Variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Run `npm run seed` once from the Render shell, or locally with the Atlas `MONGO_URI`.
4. Vercel, root `frontend`, framework Vite, variable `VITE_API_URL` set to the Render URL.
5. Set `CLIENT_URL` on Render to the exact Vercel URL with no trailing slash and redeploy.
