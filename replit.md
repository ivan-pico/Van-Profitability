# CamperROI - Campervan Rental Profitability Calculator

## Overview

CamperROI is a financial planning tool designed to help users analyze the profitability of campervan rental investments. Users can model different scenarios by adjusting vehicle costs, loan terms, operating expenses, and rental revenue projections to visualize monthly cashflow and cumulative profit over time.

The application follows a full-stack TypeScript architecture with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Charts**: Recharts for data visualization (monthly cashflow, cumulative profit)
- **Animations**: Framer Motion for smooth transitions
- **Build Tool**: Vite with hot module replacement

The frontend is organized as a single-page application with:
- Custom components for financial inputs (SliderInput, MonthSelector)
- Metric cards for key performance indicators
- Interactive charts for profit visualization
- Multi-language support (English translations object in Dashboard)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Storage Pattern**: Repository pattern via `IStorage` interface in `server/storage.ts`

API endpoints follow a consistent pattern:
- `GET /api/scenarios` - List all scenarios
- `POST /api/scenarios` - Create new scenario
- `GET /api/scenarios/:id` - Get single scenario
- `PUT /api/scenarios/:id` - Update scenario
- `DELETE /api/scenarios/:id` - Delete scenario

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod schemas for type-safe validation
- `routes.ts`: API route definitions with input/output schemas

### Data Model
Single table `scenarios` storing:
- Vehicle purchase and loan details (price, amount, term, interest rate)
- Operating costs (insurance, maintenance)
- Revenue parameters (rental price per day, monthly occupancy as 12-element array)

### Build System
- Development: Vite dev server with Express middleware
- Production: esbuild bundles server to single file, Vite builds client to static assets
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database queries and schema management
- **connect-pg-simple**: Session storage (if sessions are added)

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, tooltips, tabs, etc.)
- **shadcn/ui**: Pre-styled component variants built on Radix
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build and dev server
- **esbuild**: Server bundling for production
- **Drizzle Kit**: Database schema migrations

### Runtime Dependencies
- **Zod**: Schema validation for API requests/responses
- **TanStack Query**: Data fetching and caching
- **Framer Motion**: Animation library