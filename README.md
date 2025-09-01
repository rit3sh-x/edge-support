# Edge Customer Support Platform

A full-stack customer support platform built with Next.js, Convex, and TypeScript. This project uses a Turborepo monorepo structure with multiple applications and shared packages.

## Architecture Overview

This is a Turborepo monorepo containing:

- **Apps**: Customer-facing applications
- **Packages**: Shared libraries and backend services

### Applications

#### Web App (`apps/web`)
The main dashboard application for customer support teams.

**Technology Stack:**
- Next.js 15 with App Router
- TypeScript
- TailwindCSS
- Clerk Authentication
- Convex Database
- Radix UI Components
- Sentry Error Monitoring

**Features:**
- User authentication and organization management
- Conversation management interface
- File handling and integrations
- Plugin system
- Billing management
- Customization settings

#### Widget App (`apps/widget`)
A customer-facing chat widget for support interactions.

**Technology Stack:**
- Next.js 15
- TypeScript
- TailwindCSS
- Convex Database
- VAPI Voice AI Integration

**Features:**
- Real-time chat interface
- Voice conversation support
- Customizable widget settings
- Session management

#### Embed Script (`apps/embed`)
A lightweight JavaScript embed script for integrating the widget into external websites.

**Technology Stack:**
- Vanilla TypeScript
- Vite for bundling
- PostMessage API for communication

**Features:**
- Easy website integration
- Configurable positioning
- Real-time widget communication
- Responsive design

### Packages

#### Backend (`packages/backend`)
Convex-powered backend with real-time database and serverless functions.

**Technology Stack:**
- Convex Database
- TypeScript
- Clerk Authentication
- Google AI (Gemini)
- AWS Secrets Manager
- VAPI Integration
- Convex Agent Framework

**Features:**
- Real-time database operations
- AI-powered support agents
- RAG (Retrieval Augmented Generation)
- Webhook handling
- Secret management
- File processing

#### UI Package (`packages/ui`)
Shared component library built with shadcn/ui.

**Technology Stack:**
- React 19
- TypeScript
- TailwindCSS
- Radix UI
- shadcn/ui components

#### Configuration Packages
- `packages/eslint-config`: Shared ESLint configuration
- `packages/typescript-config`: Shared TypeScript configuration

## Prerequisites

- Node.js (>=20)
- pnpm (>=8)
- Convex account
- Clerk account (for authentication)
- Google AI API key
- AWS account (for secrets management)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rit3sh-x/edge-support.git
cd edge-support
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

#### Backend Configuration (`packages/backend/.env.local`)

Create a `.env.local` file in `packages/backend` with the following variables:

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=dev:your-deployment-name
CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication
CLERK_WEBHOOK_SECRET_KEY=whsec_your_webhook_secret
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
CLERK_SECRET_KEY=sk_test_your_secret_key

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy_your_api_key

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_aws_region
```

#### Web App Configuration (`apps/web/.env.local`)

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Sentry (optional)
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_DSN_KEY=https://your_public_key@o0.ingest.sentry.io/0

# Widget Delivery
NEXT_PUBLIC_DELIVERY_SOURCE=http://localhost:3001/widget.js
```

#### Widget App Configuration (`apps/widget/.env.local`)

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Set Up Convex Backend

#### Install Convex CLI

```bash
npm install -g convex
```

#### Initialize Convex

```bash
cd packages/backend
convex dev
```

This will:
- Set up your Convex deployment
- Deploy the database schema
- Start the development server

#### Push Environment Variables to Convex

After setting up your environment variables, push them to Convex:

```bash
cd packages/backend

# Push individual environment variables
convex env set CLERK_WEBHOOK_SECRET_KEY "whsec_your_webhook_secret"
convex env set CLERK_JWT_ISSUER_DOMAIN "https://your-domain.clerk.accounts.dev"
convex env set CLERK_SECRET_KEY "sk_test_your_secret_key"
convex env set GOOGLE_GENERATIVE_AI_API_KEY "AIzaSy_your_api_key"
convex env set AWS_ACCESS_KEY_ID "your_access_key_id"
convex env set AWS_SECRET_ACCESS_KEY "your_secret_access_key"
convex env set AWS_REGION "your_aws_region"
```

### 5. Set Up Clerk Authentication

1. Create a Clerk application at https://clerk.com
2. Configure your Clerk application:
   - Add your domain to allowed origins
   - Set up organization support if needed
   - Configure webhooks for user/organization events
3. Copy the API keys to your environment files

### 6. Development Setup

#### Start All Applications

From the root directory:

```bash
# Start all apps in development mode
pnpm dev
```

This will start:
- Web app on http://localhost:3000
- Widget app on http://localhost:3001
- Embed build process
- Convex backend in development mode

#### Start Individual Applications

```bash
# Web app only
pnpm --filter web dev

# Widget app only
pnpm --filter widget dev

# Backend only
pnpm --filter @workspace/backend dev

# Embed script only
pnpm --filter embed dev
```

### 7. Build for Production

```bash
# Build all applications
pnpm build

# Build specific app
pnpm --filter web build
pnpm --filter widget build
pnpm --filter embed build
```

## Database Schema

The Convex database includes the following main tables:

- **conversations**: Support conversation records
- **contactSessions**: Customer session management
- **widgetSettings**: Customizable widget configurations
- **plugins**: Third-party service integrations
- **subscriptions**: Organization billing information

## Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development
pnpm build            # Build all applications
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier

# Backend specific
pnpm --filter @workspace/backend dev    # Start Convex development
pnpm --filter @workspace/backend setup  # Setup Convex deployment
```

## Deployment

### Backend Deployment

The Convex backend automatically deploys when you push to your main branch (if configured with CI/CD) or manually with:

```bash
cd packages/backend
convex deploy
```

### Frontend Deployment

Deploy the web and widget applications to your preferred hosting platform (Vercel, Netlify, etc.):

1. Set up environment variables on your hosting platform
2. Connect your repository
3. Configure build commands:
   - Web: `pnpm --filter web build`
   - Widget: `pnpm --filter widget build`

### Embed Script Deployment

Build and deploy the embed script to a CDN:

```bash
pnpm --filter embed build
```

Then upload the built files to your CDN and update the `NEXT_PUBLIC_DELIVERY_SOURCE` environment variable.