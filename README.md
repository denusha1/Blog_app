# Ink & Ideas — Blog App

A full-stack blogging app built with Next.js, React, Tailwind CSS, Spring Boot, Java, PostgreSQL, Spring Security and JWT.

## Run locally with Docker

1. Copy `.env.example` to `.env` and set unique values for `POSTGRES_PASSWORD` and `JWT_SECRET`. Generate secrets with `openssl rand -hex 32`. For local use, set `FRONTEND_URL=http://localhost:3000`.
2. Start the app:

   ```sh
   docker compose up --build -d
   ```

3. Open [http://localhost:3000](http://localhost:3000). The API and database stay on the private Compose network. The API health check must pass before the frontend starts. Sample articles are seeded on an empty database by default; set `APP_SEED_SAMPLE_DATA=false` to disable this.

PostgreSQL data is stored in the persistent `postgres_data` Docker volume. The database port is bound to localhost only. Do not commit `.env` or share its secrets.

## Host on a Docker server

The Compose setup is prepared for a Linux VPS or another Docker host. It exposes the frontend on `FRONTEND_PORT` (default `3000`); the API and database are private to the Compose network. Put an HTTPS reverse proxy such as Caddy or Nginx in front of the frontend, and allow public inbound traffic only on ports `80` and `443`.

1. Point your domain’s DNS A/AAAA record at the server.
2. Copy `.env.example` to `.env`. Set a unique database password, a JWT secret generated with `openssl rand -hex 32`, `FRONTEND_URL=https://your-domain`, and optionally `APP_ADMIN_EMAIL`.
3. Start and verify the services:

   ```sh
   docker compose up --build -d
   docker compose ps
   docker compose logs -f api frontend
   ```

4. Configure your HTTPS proxy to forward the domain to `http://127.0.0.1:3000`. If another app uses that port, set `FRONTEND_PORT` to a free host port and point the proxy there.
5. Register the intended administrator account. Set `APP_ADMIN_EMAIL` to that account’s email in `.env`, then restart the API with `docker compose up -d api`.

Set `APP_SEED_SAMPLE_DATA=false` if you want a blank production library. Add Cloudinary credentials to `.env` to enable cover image uploads. Store backups of the `postgres_data` volume off-server and test restoring one before relying on production data.

The browser talks to the same-origin `/blog-api` route. Next.js forwards requests to the API over the private Docker network, so production builds never call a visitor’s `localhost`.

## Run without Docker

Start a local PostgreSQL database named `blogapp`, then run the API with explicit local development values:

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

The frontend’s server-side `/blog-api` proxy defaults to `http://localhost:8081/api` for the local setup used by this project. Set `BLOG_API_PROXY_URL` and `BLOG_CONTACT_API_PROXY_URL` if your API is elsewhere. The backend accepts `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` for image uploads.

## Features

- Public story feed with search and pagination
- Account registration, login, profile editing and password changes
- JWT-protected writing dashboard with Markdown editor, formatting tools, safe preview, and auto-saved drafts
- Draft, scheduled, published, featured, public, and private post management
- Automatic scheduled publishing and author-only editing/deletion
- Optional Cloudinary cover-image uploads
- Dashboard publishing chart with Recharts
- PostgreSQL persistence and Swagger/OpenAPI docs
- JUnit 5 and Mockito service tests

## Community, analytics, and moderation

- Author analytics for views, reactions, comments, engagement rate, popular articles, and monthly readership
- Notifications for new likes, comments, follows, and posts from followed authors
- Public author pages with profile image, bio, links, articles, and readership totals
- Article reporting and admin tools for reviewing reports, moderating posts, managing categories, and enabling accounts
- Draft assistant for title, tag, summary, grammar, and readability suggestions

To grant an existing account administrator access, set `APP_ADMIN_EMAIL` to that account's email and restart the backend. The account must exist before the backend starts.
