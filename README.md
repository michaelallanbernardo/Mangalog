# MangaLog

MangaLog is a full-stack manga tracker with:
- authenticated user accounts
- personal manga lists
- browse/search from AniList
- add/edit/remove tracking entries
- pagination, sorting, and status filters

## Project Structure

- `server/` Express + MongoDB API
- `client/` React frontend

## Requirements

- Node.js 18+
- MongoDB connection string

## Setup

### 1. Configure environment variables

Create these files from the examples:
- `server/.env`
- `client/.env`

### 2. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Run the apps

In one terminal:

```bash
cd server
npm run dev
```

In another terminal:

```bash
cd client
npm start
```

## Environment Variables

### Server

- `PORT` - server port, default `5000`
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret used to sign auth tokens

### Client

- `REACT_APP_API_URL` - API base URL, default `http://localhost:5000/api`

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/manga`
- `GET /api/manga/ids`
- `POST /api/manga`
- `PUT /api/manga/:id`
- `DELETE /api/manga/:id`
- `GET /api/browse/search`
- `GET /api/browse/trending`
- `GET /api/status`

## Notes

- Browse currently uses AniList for public manga discovery.
