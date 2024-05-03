# Ravn-Challenge-V2-CristhianOcola

# Build your tiny store

You can choose the target of your business, be creative!.

**Example:** snack store, pet store, drug store.

## Technical requirements

- [x]PostgreSQL and Prisma
- [x]Express or NestJs
- [x]Typescript
- [x]Jest
- [x]Prettier
- [x]ESLint
- []REST or GraphQL
- [x]Github repository named Ravn-Challenge-V2-<your name>

## Mandatory features

1. Authentication endpoints (sign up, sign in, sign out) [x]
2. List products with pagination
3. Search products by category
4. Add 2 kind of users (Manager, Client)
    1. As a Manager I can:
        1. Create products
        2. Update products
        3. Delete products
        4. Disable products
        5. Show client orders
        6. Upload images per product
    2. As a Client I can:
        1. See products
        2. See the product details
        3. Buy products
        4. Add products to cart
        5. Like products
        6. Show my order
5. The product information(including images) should be visible for logged and not logged users
6. [x][]Swagger/Postman documentation
7. Tests, with a least a 80% coverage

## Extra points

- e2e testing, this will be considered very valuable
- When the stock of a product reaches 3, notify the last user that liked it and not purchased the product yet with an email. Use a background job and make sure to include the product's image in the email.
- Add forgot password functionality.
- Send an email when the user change the password
- Deploy on Heroku




Clone the repository git clone https://github.com/rdev32/Ravn-Challenge-V2-Renato.git
Once inside the downloaded folder, run npm install
Create and fill your .env file as in .env.example
To generate the PostgreSQL database be sure to have docker installed and run docker-compose up
Migration to the database can be done with the command npx prisma migrate dev --name test
To get the models required for the application run npx prisma generate
Seed the database with npx prisma db seed
After doing the stepts above, run npm run build
You can now start the application with npm start