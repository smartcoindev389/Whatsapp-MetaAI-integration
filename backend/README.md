# EvoZap API

WhatsApp Business API backend for SalvaZap platform.

## Tech Stack

- NestJS
- Prisma ORM
- MySQL
- Redis
- BullMQ
- JWT Authentication
- AES-256 Encryption

## Setup

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Run the application:
```bash
npm run start:dev
```

## Docker

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker-compose -f docker-compose.yml up -d
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login
- `POST /auth/register` - Register

### Shops
- `POST /shops` - Create shop
- `GET /shops` - List shops
- `GET /shops/:id` - Get shop

### WABA
- `GET /waba/embedded/start` - Get embedded signup URL
- `GET /waba/embedded/callback` - Handle OAuth callback

### Webhooks
- `GET /webhooks/meta` - Webhook verification
- `POST /webhooks/meta` - Webhook ingestion
- `POST /webhooks/replay/:eventId` - Replay event

### Messages
- `POST /messages/send` - Send plain text message
- `POST /messages/template` - Send template message

### Inbox
- `GET /inbox/conversations` - List conversations
- `GET /inbox/conversations/:id` - Get conversation messages

### Templates
- `GET /templates` - List templates
- `POST /templates/submit` - Submit template
- `PATCH /templates/:id` - Update template status

### Campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns` - List campaigns
- `GET /campaigns/:id` - Get campaign

### Health
- `GET /health` - Health check
- `GET /metrics` - Metrics

## Environment Variables

See `.env.example` for required environment variables.

## License

UNLICENSED

