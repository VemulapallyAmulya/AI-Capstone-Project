# AI Capstone Project — ReadNest Bookstore

AI Capstone Project is a full-stack bookstore experience built with React, Vite, Spring Boot, and H2. The customer-facing storefront keeps the ReadNest name.
<img width="1862" height="903" alt="Screenshot 2026-10-12 023435" src="https://github.com/user-attachments/assets/09c27aac-7b72-4404-8db2-3f6e76085b62" />

## What is included

- Browse books
- Search books
- Filter by category
- View book details
- Add/remove books from cart
- Change quantity
- Simple checkout form
- Order confirmation
- Spring Boot REST API
- H2 database for easy local setup

The project is intentionally kept small so a beginner can understand every file.

## Tech stack

Frontend:
- React
- Vite
- Plain CSS

Backend:
- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- H2 Database

## Run the backend

Open a terminal inside:

`backend`

Then run:

```bash
mvn spring-boot:run
```

Backend runs at:

`http://localhost:8080`

## Run the frontend

Open another terminal inside:

`frontend`

Run:

```bash
npm install
npm run dev
```

Open the URL shown by Vite, normally:

`http://localhost:5173`

The Vite development and preview servers proxy `/api` requests to the backend on port `8080`. Keep the backend running while using the catalog and placing demo orders; the frontend can be opened using either `localhost` or `127.0.0.1`.

## API endpoints

- GET `/api/books`
- GET `/api/books/{id}`
- POST `/api/orders`

Example order:

```json
{
  "customerName": "Rahul",
  "address": "Hyderabad",
  "items": [
    {
      "bookId": 1,
      "quantity": 2
    }
  ]
}
```

## Project idea

The original capstone asks for an e-commerce workflow where a customer can browse books, select a product, add it to a basket, complete a purchase and receive confirmation. This project keeps those core ideas but uses a smaller, original implementation.


## Project Demonstration

Watch the ReadNest application demonstration video.

[▶ Watch ReadNest Demo Video on Google Drive](https://drive.google.com/file/d/1KB27SAImN5YaEsoO4lmjYWLgeDsM7ccJ/view?usp=drive_link)
