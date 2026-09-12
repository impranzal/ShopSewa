# ShopSewa

ShopSewa is a full-stack e-commerce web application developed for an
e-commerce laboratory project. It provides a customer shopping experience,
administrator catalog management, order management, and an eSewa test payment
flow.

## Project Overview

ShopSewa allows customers to:

- Create an account and log in securely
- Browse products by category
- Search and sort products
- View product details and related products
- Add products to a persistent shopping cart
- Change cart quantities or remove products
- Place orders using Cash on Delivery or eSewa test payment
- View their order history and order details

Administrators can:

- Add and delete products
- Edit product name, description, category, brand, stock, and featured status
- Edit regular and discounted prices
- Edit product image URLs
- Manage product categories
- Search and filter customer orders
- Update order status and payment status
- View complete order details

## Technology Stack

### Frontend

- React 18
- Vite
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Multer dependency for future upload support

### Payment

- eSewa ePay v2 test/sandbox environment
- HMAC-SHA256 request signing

## Project Structure

```text
ShopSewa/
├── backend/
│   ├── config/              MongoDB connection
│   ├── controllers/         Authentication, products, orders, payments
│   ├── middleware/          JWT and admin authorization
│   ├── models/              User, Product, Category, Order
│   ├── routes/              REST API routes
│   ├── utils/seeder.js      Sample data and admin account seeder
│   ├── .env.example         Backend environment template
│   └── server.js            Express server entry point
└── frontend/
    ├── src/components/      Shared UI components, if added
    ├── src/context/         Authentication and cart state
    ├── src/layouts/         Main application layout
    ├── src/pages/           Customer and admin pages
    ├── src/services/        Axios API client
    ├── src/utils/           Product image helpers
    └── src/App.jsx          Application routes
```

Environment templates are provided in `backend/.env.example` and
`frontend/.env.example`. Copy each template to `.env` in its respective
directory and replace placeholder values. Never commit `.env` files, JWT
secrets, database credentials, or payment credentials.

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or an accessible MongoDB instance

The default development database is:

```text
mongodb://localhost:27017/shopsewa
```

## Installation and Running

### 1. Start the backend

```powershell
cd ShopSewa/backend
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

The health endpoint is:

```text
http://localhost:5000/
```

It should return:

```text
ShopSewa API is running
```

### 2. Start the frontend

Open another terminal:

```powershell
cd ShopSewa/frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The frontend API URL can be changed with `VITE_API_URL`. If it is not set,
the application uses:

```text
http://localhost:5000/api
```

If port 5000 is already in use, do not start a second backend instance.
Check the existing server at `http://localhost:5000/`, or stop the process
using that port before restarting the backend.

## Seeded Accounts and Data

Running `npm run seed` creates:

- Four categories
- Eight sample products
- Sample product images
- An administrator account

Default administrator credentials:

```text
Email: admin@gmail.com
Password: admin123
```

These credentials are intended only for local seeded development. Change the
password or remove the seeded administrator before using the project outside
the laboratory environment.

> The seeder deletes and recreates categories and products. Do not run it
> after making catalog changes that you need to preserve.

## Main Application Routes

### Customer routes

```text
/                       Homepage
/products               Product catalog, search, category and sorting
/products/:slug         Product details and related products
/cart                   Shopping cart
/checkout               Checkout
/login                  Login
/register               Registration
/orders                 Customer order history
/orders/:id             Order details
/order-success/:id      COD order confirmation
/esewa/success          eSewa payment verification result
/esewa/failure          eSewa payment failure result
```

### Administrator routes

Administrator login is required for all admin routes:

```text
/admin                  Admin dashboard
/admin/products         Product and catalog management
/admin/categories       Category management
/admin/orders           Order and payment management
```

## Catalog and Pricing Management

From `/admin/products`, an administrator can:

- Add new products
- Edit product information
- Set regular prices
- Apply discounts using a discounted price
- Update inventory stock
- Set a product as featured
- Replace product image URLs
- Delete products

The application validates that:

- Prices are not negative
- Discounts are not negative
- A discounted price is lower than the regular price

Discounted products display a `SALE` badge and their original price is shown
with a strikethrough on the storefront.

## Product Images

Product images can be managed in two ways:

1. Use **Edit image** from the admin product table and paste an image URL.
2. Update the fallback image mappings in
   `frontend/src/utils/productImage.js`.

The current product image helper includes fallback images for electronics,
fashion, groceries, books, notebooks, honey, rice, and other catalog items.

## Order and Payment Flow

### Cash on Delivery

1. Customer adds products to the cart.
2. Customer enters shipping information.
3. Customer selects Cash on Delivery.
4. The backend creates the order and reduces product stock.
5. The customer is redirected to the order confirmation page.

### eSewa test payment

1. Customer creates an order at checkout.
2. The backend creates a signed eSewa ePay v2 request.
3. The customer is redirected to the eSewa test payment form.
4. eSewa redirects to the success or failure route.
5. The backend verifies the returned payment payload.
6. The order payment status becomes `paid` or `failed`.

The eSewa integration is configured for testing and must not be described as
a live production payment integration without replacing the test credentials
and completing merchant verification.

## Algorithms

### Search relevance ranking

When a search term is supplied, products are ranked using a composite score:

```text
relevance =
  text relevance       × 0.50
  normalized rating    × 0.30
  review popularity    × 0.15
  stock availability   × 0.05
```

The implementation is in:

```text
backend/controllers/productController.js
```

This algorithm prioritizes products that match the search while also
considering quality, popularity, and whether they are available.

### Related-products algorithm

Related products are selected using:

- The same category
- A price range within 30% above or below the current product
- Exclusion of the current product
- A maximum of six related products

## API Groups

```text
/api/auth
/api/categories
/api/products
/api/orders
/api/payments
```

Admin product, category, and order operations require a valid JWT belonging
to an administrator.

## Academic Report Guidance

The application is suitable as an e-commerce laboratory project, but the
formal academic report must be submitted separately according to the
institution's B.Sc. CSIT Project Work format.

Recommended report sections:

1. Cover page
2. Acknowledgement
3. Abstract
4. Table of contents
5. Introduction
6. Problem statement
7. Objectives and scope
8. Literature review
9. Requirement analysis
10. Feasibility study
11. System architecture
12. Use-case, activity, sequence, and data-flow diagrams
13. Database design and ER diagram
14. Algorithm design and explanation
15. Implementation details
16. Payment integration
17. Testing and test cases
18. Screenshots
19. Results and discussion
20. Limitations and future enhancements
21. Conclusion
22. References
23. Appendix

The report should include screenshots of the homepage, product catalog,
search, cart, checkout, payment result, customer orders, admin products,
discount editing, category management, and order management.

## Testing Checklist

Before demonstrating the project, verify:

- MongoDB is running
- The backend health endpoint responds
- The frontend can load categories and products
- Registration and login work
- Product search and category filtering work
- Cart quantities and totals update correctly
- COD checkout creates an order
- eSewa test checkout reaches the payment result page
- Admin product edits persist after refresh
- Discounts show the sale price and original price
- Admin order and payment statuses update successfully

## Security and Deployment Notes

- Do not commit real secrets or production payment credentials.
- Before the first GitHub push, verify that `.env`, `node_modules`, and
  `dist` are not staged.
- Replace the development `JWT_SECRET` before deployment.
- Use a production MongoDB connection string for deployment.
- Restrict CORS to the deployed frontend origin.
- Use HTTPS for authentication and payment flows.
- Use a real image upload/storage service before production use.

## License

This project is intended for academic and laboratory use.

## Publishing to GitHub

From the project root, review the files before publishing:

```powershell
cd ShopSewa
git init
git status --short
```

The root `.gitignore` excludes dependencies, build output, local uploads,
editor files, and environment files. Confirm that the following are not
staged:

```text
backend/.env
frontend/.env
backend/node_modules/
frontend/node_modules/
frontend/dist/
```

Create the first commit:

```powershell
git add .
git status
git commit -m "Initial ShopSewa e-commerce application"
```

The project repository is available at:

```text
https://github.com/impranzal/ShopSewa
```

To connect a local clone to this repository and push:

```powershell
git branch -M main
git remote add origin https://github.com/impranzal/ShopSewa.git
git push -u origin main
```

If `origin` is already configured, check it with:

```powershell
git remote -v
```

If it points to a different repository, update it with:

```powershell
git remote set-url origin https://github.com/impranzal/ShopSewa.git
```

If a real secret was ever committed before adding the ignore rules, remove it
from the repository history and rotate it. Changing `.gitignore` alone does
not remove a previously committed secret.
