# AI Capstone Project — ReadNest Bookstore

ReadNest is a full-stack bookstore capstone project for discovering books and trying a complete demo shopping flow. The storefront is built with React and Vite; a Spring Boot API serves a seeded book catalog and demo order references.

[![ReadNest storefront](https://github.com/user-attachments/assets/09c27aac-7b72-4404-8db2-3f6e76085b62)](https://github.com/VemulapallyAmulya/AI-Capstone-Project)

## Features

- Browse and search a 100-book catalog, filter by category, and sort by title or price.
- See distinct book covers, publication dates, author profiles, previous works, and clearly labeled sample reviews.
- Save books to a reading list and add books to a persistent shopping bag.
- Use the book buddy for catalog-based recommendations by genre, mood, or budget. It is a local rule-based assistant, not an external AI service.
- Follow a responsive three-step checkout with delivery details, payment preference selection, and an order review.
- Choose demo payment preferences, including card networks, UPI apps, net banking, and cash on delivery.
- View browser-local order history and a simulated tracking timeline.
- Use the cached catalog if the backend is temporarily unavailable.

## Demo limitations

This project is a bookstore prototype. No payment provider is connected, no payment is collected, and no card, UPI, or bank credentials should be entered. Order tracking is simulated, and order history is stored in the current browser. Reviews and generated author profiles are sample demo content.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | React 18, Vite, CSS |
| Backend | Java 21, Spring Boot 3, Spring Web |
| Data | Spring Data JPA, H2 |

## Run locally

Requirements: Java 21, Maven, and Node.js with npm.

1. Start the backend from the repository root:

   ```powershell
   cd backend
   mvn spring-boot:run
   ```

   The API starts at `http://localhost:8080`. The local H2 database is stored under `backend/data`.

2. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

3. Open the URL printed by Vite, usually `http://localhost:5173`. Keep the backend running for live catalog and order API requests. Vite proxies `/api` calls to port `8080`.

Build the frontend for production:

```powershell
cd frontend
npm run build
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/books` | List the catalog |
| `GET` | `/api/books/{id}` | Get one book |
| `POST` | `/api/orders` | Create a demo order reference |

Example order request:

```json
{
  "customerName": "Rahul",
  "address": "Hyderabad",
  "paymentMethod": "UPI · Google Pay",
  "items": [
    {
      "bookId": 1,
      "quantity": 2
    }
  ]
}
```

## Project structure

```text
backend/   Spring Boot application, REST API, catalog seeder, and H2 configuration
frontend/  React storefront, checkout experience, styles, and bundled book covers
```

## Project demonstration

[▶ Watch the ReadNest demo video](https://drive.google.com/file/d/1KB27SAImN5YaEsoO4lmjYWLgeDsM7ccJ/view?usp=drive_link)
