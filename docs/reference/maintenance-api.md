# Maintenance API Reference

Quick-capture system for logging motorcycle maintenance tasks via Lambda API + PostgreSQL.

## Status

| Component | Status |
|-----------|--------|
| Database Schema | ✅ Complete |
| Lambda API Endpoints | ✅ Complete |
| Web Login Page | ✅ Complete |
| Web Form Page | ✅ Complete |
| Task Completion Toggle | ✅ Complete |
| Local Testing | ✅ Working |
| Remote Access (Tailscale) | ⚠️ Issue found |
| Production Deployment | ⏳ Pending |

**Last Updated:** 2026-02-17

## Architecture

```
Web Form (Astro) → Lambda API (localhost:3000) → PostgreSQL (Docker on Pi)
```

**Production target:**
```
Web Form (HTTPS) → AWS API Gateway (HTTPS) → PostgreSQL (Docker on Pi)
```

## Database Schema

Located in `moto_db` on Pi's PostgreSQL Docker container (renamed from `moto_db_local` on 2026-07-02).

```sql
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bike_id UUID REFERENCES motorcycles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    notes TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Bike UUIDs

| UUID | Bike |
|------|------|
| `d8454deb-4ac6-4ed3-8c46-255c293685f4` | KX450F (2014) |
| `9f803ba6-27db-4f7c-8403-7118b5b49035` | Z125 (2018) |
| `37053aac-a94d-43d4-a523-43c8b9fc6686` | ZX6R (2009) |

## API Endpoints

All endpoints require `x-api-key` header for authentication.

### POST /maintenance

Create a new maintenance task.

**Request:**
```json
{
  "bike_id": "37053aac-a94d-43d4-a523-43c8b9fc6686",
  "title": "Change oil",
  "priority": "high",
  "notes": "Use 10W-40 synthetic"
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "bike_id": "37053aac-a94d-43d4-a523-43c8b9fc6686",
  "title": "Change oil",
  "priority": "high",
  "notes": "Use 10W-40 synthetic",
  "completed": false,
  "created_at": "2026-02-22T10:30:00Z"
}
```

### GET /maintenance

List all maintenance tasks.

**Response:**
```json
[
  {
    "id": "uuid-here",
    "bike_id": "37053aac-a94d-43d4-a523-43c8b9fc6686",
    "bike_name": "ZX6R",
    "title": "Change oil",
    "priority": "high",
    "notes": "Use 10W-40 synthetic",
    "completed": false,
    "created_at": "2026-02-22T10:30:00Z"
  }
]
```

### PATCH /maintenance/{id}

Update a task (e.g., toggle completion).

**Request:**
```json
{
  "completed": true
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "completed": true
}
```

## Web Pages

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/admin/login` | API key entry, stores in localStorage |
| Form | `/admin/maintenance` | Quick-capture form + task list |

## Running Locally

1. **Start the Lambda server** (on Pi):
   ```bash
   cd /home/staub-racing/Projects/Mobile-Apps/MotoAppPro/moto-lambda-API
   yarn start:offline-local
   ```

2. **Start the Astro dev server**:
   ```bash
   cd /home/staub-racing/Projects/Websites/staubracing.com
   yarn dev
   ```

3. **Access the form**:
   ```
   http://localhost:4321/admin/login
   ```

## Known Issues

### Tailscale Routing
- Accessing API via Tailscale IP (100.85.179.68:3000) returns wrong routes
- Works fine via localhost:3000
- Needs investigation or deploy to AWS for remote access

### Mixed Content
- Production site (HTTPS) can't call HTTP API
- Solution: Deploy Lambda to AWS API Gateway (provides HTTPS)

## Next Steps

1. Deploy Lambda to AWS — Get HTTPS endpoint for production
2. Set `MAINTENANCE_API_URL` env var — Point to AWS API Gateway
3. Debug Tailscale — Or skip if AWS deployment works
4. Mobile app sync — Connect React Native app to same endpoints

## Related Files

### Website

| File | Description |
|------|-------------|
| `src/pages/admin/login.astro` | API key entry page |
| `src/pages/admin/maintenance.astro` | Quick-capture form |
| `src/components/ui/MaintenanceList.astro` | Task list component |

### Backend (moto-lambda-API)

| File | Description |
|------|-------------|
| `src/types/maintenanceFields.ts` | TypeScript interfaces |
| `src/models/Maintenance.ts` | Database CRUD operations |
| `src/handlers/maintenance/create.ts` | POST /maintenance |
| `src/handlers/maintenance/findAll.ts` | GET /maintenance |
| `src/handlers/maintenance/update.ts` | PATCH /maintenance/{id} |
| `serverless.yml` | Route definitions + API key env var |
