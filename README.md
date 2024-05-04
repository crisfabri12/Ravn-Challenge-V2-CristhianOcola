# Ravn-Challenge-V2-CristhianOcola

## Setup

- Use the `docker-compose.yaml` file to set up the necessary application dependencies like Postgres.
- Install project dependencies using `npm install`.
- Rename `.env.sample` to `.env` and configure the environment variables.
- Run `npx prisma db push` to create the database schema using Prisma.
- Start the application with `npm run start`.
- Test the application with `npm run test`.

## API

- Explore the available endpoints in Swagger by visiting [http://localhost:<PORT>/api](http://localhost:<PORT>/api).

## Tini Store Points

### Library Store

1. Authentication endpoints (sign up, sign in, sign out).
2. List products with pagination.
3. Search products by category.
4. Two kinds of users (Manager, Client):
    - As a Manager, I can:
        1. Create products.
        2. Update products.
        3. Delete products.
        4. Disable products.
        5. Show client orders.
        6. Upload images per product.
    - As a Client, I can:
        1. See products.
        2. See product details.
        3. Buy products.
        4. Add products to cart.
        5. Like products.
        6. Show my orders.
5. Product information (including images) visible for both logged-in and non-logged-in users.
6. Swagger/Postman documentation.
7. Tests, with at least 80% coverage.
    - E2E testing is highly valuable.
- Notify the last user who liked a product but hasn't purchased it yet when the stock reaches 3. Use a background job and include the product's image in the email.
- Implement forgot password functionality.
- Send an email when the user changes the password.
- Deploy on Heroku.
