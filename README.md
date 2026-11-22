# Kickroom

A bold streetwear and sneaker storefront. The React app includes product search, category and price filters, a browser-persistent bag, and responsive layouts. An Express/MongoDB API is also included for a separate full-stack setup.

## Requirements

- Node.js 20+
- MongoDB running locally, or a MongoDB connection string

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` if needed.
2. Copy `frontend/.env.example` to `frontend/.env` if the API is not at `http://localhost:5000/api`.
3. From the project root, install dependencies with `npm install`, `npm install --prefix backend`, and `npm install --prefix frontend`.
4. Seed the catalog with `npm run seed`.
5. Start the API and storefront together with `npm run dev`.
6. Open `http://localhost:5173`.

The API is available at `http://localhost:5000/api`; `/api/health` reports API and database connection status.

## Public Netlify storefront preview

The storefront includes a built-in sample catalog and can be deployed without an API or database. The root `netlify.toml` configures the `frontend` base directory, build command, and `dist` publish directory.

To publish it, push the project to a Git provider, then in Netlify choose **Add new site → Import an existing project** and connect the repository. Netlify will build and publish the storefront, then provide a public `*.netlify.app` URL. The public preview supports product search, filters, and a browser-only bag; accounts, order history, and checkout are not enabled in this frontend preview.

## Demo checkout

Accounts and orders are stored in MongoDB. Checkout requires a signed-in account, and the server also rejects unauthenticated order requests. The server validates the customer and cart, calculates totals from current catalog prices, and reserves stock for successful demo payments. Failed demo payments never create an order or change stock. Prices are displayed in Indian rupees (INR). Shipping is ₹499 under ₹6,000 and free at ₹6,000 or more. Orders can be advanced through confirmed, shipped, and delivered states. No real payment provider is integrated.

## Scripts

- `npm run dev` — start both development servers
- `npm run build` — create the production frontend build
- `npm run seed` — upsert the sample catalog
