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
CANBAN_API_URL=https://canbanapi.baxic.ru/api
CANBAN_EMAIL=
CANBAN_PASSWORD=
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
- `attachment` - optional, allowed: `jpg`, `jpeg`, `png`, `bmp`, `gif`, `pdf`, `doc`, `docx`, `txt`, up to 10 MB

Requests are saved to the database table `contact_submissions`.
Uploaded files are saved to S3. The database stores file metadata, `attachment_s3_key`, and `attachment_url`.
Each request is also synced to Canban as a quest. If an attachment exists, it is uploaded to the Canban quest too.

## Environment

Current `.env`:

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
CANBAN_API_URL=https://canbanapi.baxic.ru/api
CANBAN_EMAIL=
CANBAN_PASSWORD=
```

## Canban Integration

Required:

- `CANBAN_EMAIL` / `CANBAN_PASSWORD` - service account credentials for Canban API. The server logs in and caches JWT automatically.

Optional:

- `CANBAN_COLUMN_TITLE` - target column title, defaults to `К выполнению`.
- `CANBAN_COLUMN_ID` - target column UUID. If empty, the server finds a column by `CANBAN_COLUMN_TITLE`.
- `CANBAN_BOARD_ID` / `CANBAN_BOARD_NAME` - override automatic customer board selection.
- `CANBAN_TEAM_ID` / `CANBAN_TEAM_NAME` - override automatic customer team selection.
- `CANBAN_NOTIFICATION_USER_IDS` - comma-separated Canban user IDs that should always receive quest notifications.
- `CANBAN_ASSIGNEE_ID` - user assigned to created quests.
- Request email is sent to Canban as `externalNotificationRecipients`, so the requester can receive status notifications without a Canban account.

By default, the server finds or creates a Canban team and board named after the customer from the form (`company` if present, otherwise `name`). The task is then created in the `К выполнению` column on that board.

## Logging

The server writes application logs to `LOG_FILE`.
In Docker, logs are stored in `/app/logs/server.log` and persisted in the `server_logs` volume.
