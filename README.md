# FlowCraft - Project Management System

A beautiful, fast, and scalable Project Management System built with modern technologies.

## Features

- **Projects**: Create and manage multiple projects with custom colors
- **Tasks**: Kanban-style task management with drag-and-drop
- **Subtasks**: Break down tasks into smaller actionable items
- **Activities**: Automatic audit log of all project changes
- **Labels**: Organize tasks with color-coded labels
- **Priorities**: Set task priorities (low, medium, high, urgent)
- **Due Dates**: Track task deadlines
- **Responsive**: Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.5+
- **Styling**: Tailwind CSS 4+ with shadcn/ui
- **Database**: Neon (serverless PostgreSQL) + Drizzle ORM
- **Authentication**: Custom JWT-based auth (no external providers)
- **State Management**: TanStack React Query
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable

## Prerequisites

- Node.js 18+
- Neon account (for PostgreSQL database)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd textflowcraft
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
# Database - Get this from your Neon dashboard
DATABASE_URL=your_neon_connection_string

# Authentication - Generate a strong secret key (at least 32 characters)
JWT_SECRET=your_strong_secret_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generating JWT_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Set up the database

```bash
# Push schema to database (creates tables)
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### 6. Create your account

1. Navigate to http://localhost:3000/register
2. Create your account with name, email, and password
3. You'll be redirected to the dashboard

## Project Structure

```
textflowcraft/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/           # Protected pages (dashboard, projects)
│   └── api/              # API routes
├── components/            # React components
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Layout components (sidebar, header)
├── features/             # Feature-based modules
│   ├── auth/            # Authentication (actions, schemas)
│   ├── projects/        # Project feature
│   └── tasks/           # Task feature
├── lib/                  # Utilities and config
│   ├── db.ts            # Database connection
│   ├── auth.ts          # Auth utilities
│   └── utils.ts         # General utilities
└── db/                  # Database schema and migrations
    └── schema.ts        # Drizzle schema
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate migrations
- `npm run db:studio` - Open Drizzle Studio

## Security Notes

1. **JWT_SECRET**: Keep this secret and never commit it to version control
2. **DATABASE_URL**: Your Neon connection string contains credentials - never commit this
3. **Cookies**: Auth tokens are stored in httpOnly, secure cookies
4. **Passwords**: Passwords are hashed using bcrypt with 12 rounds
5. **Validation**: All user inputs are validated using Zod schemas

## Deployment

### Netlify (Recommended)

1. Push your code to GitHub
2. Log in to Netlify and "Add new site" → "Import an existing project"
3. Select your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add your environment variables:
   - `DATABASE_URL` - Your Neon connection string
   - `JWT_SECRET` - Your secret key
   - `NEXT_PUBLIC_APP_URL` - Your Netlify URL
6. Deploy!

**Note for Netlify**: Since this uses server-side features (Next.js API routes, server actions), make sure to configure the Netlify function region to match your database region for optimal performance.

### Vercel (Alternative)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## License

MIT License