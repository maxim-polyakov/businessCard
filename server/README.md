# Business Card API

FastAPI backend for the contact form.

## Run locally

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Before starting, configure database connection in `server/.env`:

```bash
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
CORS_ORIGINS=https://baxic.ru,https://www.baxic.ru
S3_ENDPOINT_URL=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
S3_REGION=
S3_PUBLIC_URL_BASE=
LOG_LEVEL=INFO
LOG_FILE=./logs/server.log
```

## Run with Docker Compose

From the project root:

```bash
docker compose up -d --build fastapi-server
```

Docker endpoint:

```bash
GET http://localhost:3016/api/health
```

Health check:

```bash
GET http://localhost:8000/api/health
```

Contact form endpoint:

```bash
POST http://localhost:8000/api/contact
Content-Type: multipart/form-data
```

Fields:

- `name` - required
- `email` - required
- `message` - required
- `company` - optional
- `phone` - optional
- `consent` - required, must be `true`
- `attachment` - optional, allowed: `jpg`, `jpeg`, `png`, `bmp`, `gif`, `pdf`, up to 10 MB

Requests are saved to the database table `contact_submissions`.
Uploaded files are saved to S3. The database stores file metadata, `attachment_s3_key`, and `attachment_url`.

## Environment

Optional variables:

```bash
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
CORS_ORIGINS=https://baxic.ru,https://www.baxic.ru
S3_ENDPOINT_URL=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
S3_REGION=
S3_PUBLIC_URL_BASE=
LOG_LEVEL=INFO
LOG_FILE=./logs/server.log
```

## Logging

The server writes application logs to `LOG_FILE`.
In Docker, logs are stored in `/app/logs/server.log` and persisted in the `server_logs` volume.
