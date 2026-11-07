# Ink & Ideas — Blog App

A full-stack blogging app built with Next.js, React, Tailwind CSS, Spring Boot, Java, PostgreSQL, Spring Security and JWT.

## Run with Docker

1. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`. Add Cloudinary credentials if you want cover image uploads.
2. Start the app:

   ```sh
   docker compose up --build
   ```

3. Open the web app at [http://localhost:3000](http://localhost:3000). The API is at [http://localhost:8080](http://localhost:8080), with interactive API docs at [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).

PostgreSQL data is stored in the `postgres_data` Docker volume. Hibernate creates and updates the tables on startup.

## Run without Docker

Start a local PostgreSQL database named `blogapp`, then run the API:

```sh
cd backend
DATABASE_URL=jdbc:postgresql://localhost:5432/blogapp DATABASE_USERNAME=blogapp DATABASE_PASSWORD=blogapp mvn spring-boot:run
```

In a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` if the API is not at `http://localhost:8080/api`. The backend accepts `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` for image uploads.

## Features

- Public story feed with search and pagination
- Account registration, login, profile editing and password changes
- JWT-protected writing dashboard and author-only post editing/deletion
- Optional Cloudinary cover-image uploads
- Dashboard publishing chart with Recharts
- PostgreSQL persistence and Swagger/OpenAPI docs
- JUnit 5 and Mockito service tests
