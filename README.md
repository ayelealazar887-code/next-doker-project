# Full-Stack Order Management System

A full-stack order management application built with **Next.js, TypeScript, Express, Prisma, and PostgreSQL**. The project provides a structured REST API for managing users, products, inventory, and orders, with a modern Next.js frontend.

## Tech Stack

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS
* **Backend:** Node.js, Express, TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Infrastructure:** Docker & Docker Compose
* **Testing:** Vitest, Supertest

## Architecture

```text
Next.js
   │
   │ REST API
   ▼
Express + TypeScript
   │
   │ Prisma
   ▼
PostgreSQL
```

## Features

* User and product management
* Order and order-item management
* Inventory/stock tracking
* Order status management
* Database transactions for order processing
* RESTful API
* Dockerized backend and PostgreSQL
* Type-safe development with TypeScript

## Project Structure

```text
next-doker-project/
├── client/        # Next.js frontend
├── server/        # Express backend
├── docker-compose.yml
└── README.md
```

## Getting Started

Clone the repository and install dependencies:

```bash
cd client
npm install

cd ../server
npm install
```

Configure the required environment variables in `server/.env`.

Start the development environment:

```bash
docker compose up -d --build
```

Start the frontend:

```bash
cd client
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend runs on `http://localhost:5000`.

## Development Goals

This project focuses on building a production-oriented full-stack application with clean architecture, relational database design, transactional operations, containerization, and a type-safe development workflow.
