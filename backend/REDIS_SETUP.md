# Redis Setup Guide

## Why Redis is Required

Redis is **required** for this application because it powers the BullMQ queue system. The application uses Redis for:

1. **Webhook Processing Queue** - Processes incoming WhatsApp webhook events asynchronously
2. **Campaign Sender Queue** - Sends campaign messages in the background with rate limiting
3. **Queue Monitoring** - Health checks and metrics tracking

**Without Redis, these features will not work.**

## Quick Setup with Docker (Recommended)

The easiest way to get Redis running:

```bash
# Start only Redis container
docker-compose up -d redis

# Or start all services (MySQL + Redis)
docker-compose up -d mysql redis
```

This will start Redis on `localhost:6379` automatically.

## Local Installation

### Windows

**Option 1: Using WSL (Windows Subsystem for Linux)**
```bash
# In WSL terminal
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

**Option 2: Using Memurai (Redis for Windows)**
- Download from: https://www.memurai.com/get-memurai
- Install and start the service

**Option 3: Using Docker Desktop**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### macOS

```bash
# Using Homebrew
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Verify Redis is Running

Test the connection:

```bash
# Using redis-cli
redis-cli ping
# Should return: PONG

# Or check if port is open
telnet localhost 6379
```

## Configuration

The application connects to Redis using the `REDIS_URL` environment variable:

```env
REDIS_URL=redis://localhost:6379
```

For production with authentication:
```env
REDIS_URL=redis://:password@host:6379
```

## What Happens Without Redis?

If Redis is not running when you start the application:

1. **Application will fail to start** - BullMQ requires a Redis connection
2. **Queue features won't work:**
   - Webhook processing will fail
   - Campaign sending will fail
   - Background jobs won't execute

## Production Considerations

1. **Redis Persistence** - Configure Redis to persist data (AOF or RDB)
2. **Redis Sentinel** - Use Redis Sentinel for high availability
3. **Redis Cluster** - For horizontal scaling
4. **Connection Pooling** - Already handled by BullMQ/ioredis
5. **Memory Limits** - Set appropriate `maxmemory` policy

## Monitoring

Check Redis status:
```bash
redis-cli info
```

Monitor Redis in real-time:
```bash
redis-cli monitor
```

View queue information:
- Access `/health` endpoint to see queue metrics
- Use `/metrics` endpoint for detailed statistics

## Troubleshooting

### Connection Refused

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solutions:**
1. Verify Redis is running: `redis-cli ping`
2. Check Redis is listening: `netstat -an | grep 6379`
3. Verify `REDIS_URL` in `.env` file

### Redis Connection Timeout

**Solutions:**
1. Check firewall settings
2. Verify Redis bind address in `redis.conf`
3. Check network connectivity

### Out of Memory

**Solutions:**
1. Configure `maxmemory` in Redis config
2. Set eviction policy: `maxmemory-policy allkeys-lru`
3. Monitor memory usage: `redis-cli info memory`

## Alternative: Make Redis Optional (Advanced)

If you absolutely cannot use Redis, you would need to:

1. Remove BullMQ queues
2. Make webhook processing synchronous
3. Remove background job processing
4. Refactor campaign sending to be synchronous

**⚠️ This is NOT recommended** as it would significantly reduce application performance and reliability.

## Resources

- [Redis Documentation](https://redis.io/documentation)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [ioredis Documentation](https://github.com/redis/ioredis)

