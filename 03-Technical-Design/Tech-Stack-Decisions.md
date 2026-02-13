# Tech Stack Decisions

## Decision Framework
Each choice evaluated on:
- **Development Speed** – time to MVP
- **Maintainability** – long‑term support, community
- **Scalability** – handles growth in users/buildings
- **Team Skills** – what we already know
- **Cost** – hosting, licensing, third‑party services

---

## Frontend

### Mobile App: React Native
**Why:** 
- Single codebase for iOS & Android
- Large ecosystem (libraries, tools, talent pool)
- Facebook‑backed, stable long‑term
- We have JavaScript/React experience

**Alternatives Considered:**
- **Flutter:** Excellent performance, but Dart learning curve
- **Native (Swift/Kotlin):** Best performance, but double development
- **PWA:** Limited camera/notification access

**Key Libraries:**
- Navigation: `@react-navigation/native`
- State: `@reduxjs/toolkit`
- UI: `react-native-paper` (Material Design) or `react-native-elements`
- Camera: `react-native-image-picker`
- Maps: `react-native-maps`
- Notifications: `react-native-push-notification`

### Web Dashboard: React + TypeScript
**Why:**
- Consistency with mobile app (shared logic possible)
- TypeScript catches errors early
- Vast component library ecosystem

**Key Libraries:**
- UI: `@mui/material` (Material‑UI) or `Chakra UI`
- Charts: `recharts`
- Forms: `react-hook-form`
- Tables: `react-table`
- Maps: `leaflet` or `google-maps-react`

---

## Backend

### Runtime: Node.js (Express)
**Why:**
- JavaScript across stack (frontend + backend)
- Async‑first, handles I/O‑heavy workloads well
- Massive npm ecosystem
- We already use Node.js in OpenClaw

**Alternatives Considered:**
- **Python (FastAPI):** Excellent for data/ML, but context‑switch from JS
- **Go:** Great performance, but steeper learning curve
- **Ruby on Rails:** Rapid prototyping, but less common in our team

**Key Libraries:**
- Framework: `express`
- Validation: `joi` or `zod`
- Auth: `jsonwebtoken`, `bcrypt`
- Database ORM: `prisma` (recommended) or `sequelize`
- File uploads: `multer` + `multer-s3`
- Email: `nodemailer` + SendGrid
- SMS: `twilio` SDK

---

## Database

### Primary: PostgreSQL
**Why:**
- ACID compliance, relational integrity
- Excellent JSON support (for flexible attributes)
- Strong ecosystem (tools, hosting, monitoring)
- We already use it in other projects

**Alternatives Considered:**
- **MongoDB:** Schema‑less, but less transactional safety
- **MySQL:** Similar to PostgreSQL, but weaker JSON support
- **Firestore:** Serverless, but vendor lock‑in

**Extensions:**
- `pgvector` – for future ML embeddings (similar issue search)
- `PostGIS` – for geographic queries (multi‑city portfolios)

### Caching: Redis
**Why:**
- Session storage
- Rate‑limiting counters
- Queue for background jobs (with `bull`)

---

## Cloud & Infrastructure

### Hosting: AWS
**Why:**
- Comprehensive service catalog
- Free tier for initial development
- We have some AWS experience

**Services:**
- Compute: **Elastic Beanstalk** (simpler) or **ECS** (Docker)
- Database: **RDS PostgreSQL** (managed backups, scaling)
- Storage: **S3** (photos, documents) + **CloudFront** (CDN)
- Queue: **SQS** (background job decoupling)
- Search: **Elasticsearch** (future: issue search)

**Alternatives Considered:**
- **Google Cloud:** Similar capabilities, better ML tools
- **Azure:** Strong enterprise integration
- **Heroku:** Simpler, but more expensive at scale

### CI/CD: GitHub Actions
**Why:**
- Tight GitHub integration
- Generous free tier
- YAML‑based, easy to version

**Workflow:**
1. Push to `develop` → run tests
2. Merge to `main` → deploy to staging
3. Tag release → deploy to production

---

## Third‑Party Services

### Notifications
- **SMS:** Twilio (global coverage, good docs)
- **Email:** SendGrid (transactional email specialist)
- **Push:** Firebase Cloud Messaging (FCM) – free, reliable

### Payments (Future)
- **Stripe:** Developer‑friendly, great API
- **Connect:** For paying vendors directly

### Monitoring
- **Application:** New Relic (free tier) or AWS X‑Ray
- **Logs:** Winston → CloudWatch Logs
- **Errors:** Sentry (free for small scale)

### Analytics
- **Product:** Mixpanel or Amplitude (event tracking)
- **Business:** Metabase (self‑hosted BI) or Google Data Studio

---

## Development Tools

### Version Control: Git + GitHub
- **Branch strategy:** GitFlow or GitHub Flow
- **PR templates:** Standardized code review
- **Protected branches:** `main`, `develop`

### Project Management
- **Issues:** GitHub Projects (free, integrated)
- **Docs:** GitHub Wiki + this markdown structure
- **Design:** Figma (collaborative, prototyping)

### Local Development
- **Containerization:** Docker + Docker Compose
- **Environment variables:** `dotenv`
- **Database migrations:** Prisma Migrate or `db-migrate`

---

## Trade‑Offs & Risks

### Accepted Trade‑Offs
1. **React Native performance** ~90% of native – acceptable for this use case
2. **Node.js single‑threaded** – mitigated by microservices if needed
3. **AWS lock‑in** – acceptable given market dominance and our familiarity

### Mitigation Plans
- **Vendor lock‑in:** Use abstraction layers (e.g., `multer-s3` not direct AWS SDK)
- **Scaling bottlenecks:** Design stateless services, ready for horizontal scaling
- **Team skills:** Start with technologies we know, invest in training for new ones

---

## Revision History
| Date | Decision | Changed From | Reason |
|------|----------|--------------|--------|
| 2026‑02‑13 | React Native over Flutter | – | Team JS experience, faster MVP |
| 2026‑02‑13 | PostgreSQL over MongoDB | – | Transactional integrity, relational data |
| 2026‑02‑13 | AWS over Heroku | – | Cost‑effective at scale, more control |

---
*Tech stack version: 1.0. Updated: 2026‑02‑13*