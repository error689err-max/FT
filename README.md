# Family Tree MVP

A modern, multi-tenant family tree web application built with Next.js, TypeScript, Tailwind CSS, Supabase, and React Flow.

## 🌳 Features

### Core Functionality
- **People Management** - Create, edit, delete, and search family members
- **Relationship Tracking** - Define parent-child and partnership relationships
- **Family Tree Visualization** - Interactive tree view using React Flow
- **Relationship Analysis** - Find how any two people are related
- **Statistics Dashboard** - View family tree metrics and insights
- **Data Export** - Download your family data as JSON

### User Experience
- 🌙 **Dark Mode** - Complete dark/light theme support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - Email/password or Google OAuth
- 👥 **Multi-Tenancy** - Completely isolated family trees per user
- ⚙️ **Settings & Account** - Manage tree and account preferences

### Technical
- **TypeScript Strict Mode** - Full type safety
- **Multi-Tenant Architecture** - Row-level security (RLS) policies
- **RESTful API** - 14 comprehensive endpoints
- **Database Schema** - Optimized for genealogical data
- **Error Handling** - Graceful error states on all pages
- **Input Validation** - Comprehensive client and server-side validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- npm or yarn

### Local Development

1. **Clone & Install**
```bash
git clone <repository-url>
cd family-tree-mvp
npm install
```

2. **Environment Setup**
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

3. **Database Setup**
```bash
# Run migrations in Supabase SQL Editor
# See supabase/migrations/ folder
```

4. **Run Development Server**
```bash
npm run dev
# Visit http://localhost:3000
```

## 📖 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API endpoint reference
- **[Project Status](./PROJECT_STATUS.md)** - Feature completion and metrics
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment steps
- **[Architecture Design](./design.md)** - System architecture and design decisions

## 📁 Project Structure

```
family-tree-mvp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public auth pages
│   ├── (protected)/              # Protected pages (require login)
│   │   ├── people/              # People management
│   │   ├── tree/                # Family tree visualization
│   │   ├── related/             # Relationship analyzer
│   │   ├── stats/               # Statistics dashboard
│   │   └── settings/            # User settings
│   └── api/                     # API routes
│       ├── people/              # People endpoints
│       ├── export/              # Data export
│       ├── relationship-analysis/ # Relationship analysis
│       └── tree-info/           # Tree management
├── components/                  # Reusable components
├── lib/                         # Business logic
│   ├── db/                      # Database queries
│   ├── relationships/           # Relationship calculations
│   ├── tree/                    # Tree layout algorithm
│   ├── validators/              # Input validation
│   └── supabase/               # Supabase clients
├── types/                       # TypeScript types
├── tests/                       # Unit tests
└── supabase/                   # Database migrations
```

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + Google OAuth
- **Visualization:** React Flow
- **Testing:** Vitest

### Database Schema
- `tree` - Family tree metadata
- `tree_member` - User memberships and roles
- `person` - Individual people
- `parent_child` - Parent-child relationships
- `partnership` - Romantic partnerships

### Security
- Row-level security (RLS) policies
- Multi-tenant isolation via tree_id
- Role-based access control (owner/editor/viewer)
- Input validation and sanitization
- Secure API authentication

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests once (CI mode)
npm run test:run

# Run specific test file
npm run test -- relationship.test.ts
```

## 🔨 Development

### Build
```bash
npm run build
```

### Type Check
```bash
npm exec tsc -- --noEmit
```

### Lint
```bash
npm run lint
```

## 📊 API Endpoints

### People
- `GET /api/people` - List all people
- `POST /api/people` - Create person
- `GET /api/people/[id]` - Get person details
- `PATCH /api/people/[id]` - Update person
- `DELETE /api/people/[id]` - Delete person

### Relationships
- `GET /api/people/[id]/parents` - Get parents
- `GET /api/people/[id]/children` - Get children
- `GET /api/people/[id]/partners` - Get partners
- `POST /api/people/[id]/parents/add` - Add parent
- `POST /api/people/[id]/parents/remove` - Remove parent
- `POST /api/people/[id]/partners/add` - Add partner
- `POST /api/people/[id]/partners/remove` - Remove partner

### Analysis & Export
- `POST /api/relationship-analysis` - Analyze relationship between two people
- `GET /api/export/tree` - Export family tree as JSON
- `GET /api/tree-info` - Get tree information
- `PATCH /api/tree-info` - Update tree settings

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details.

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed steps.

## 📈 Status

**MVP Version: 1.0.0** - Production Ready ✅

All core features implemented and tested:
- ✅ People CRUD operations
- ✅ Relationship management
- ✅ Tree visualization
- ✅ Statistics dashboard
- ✅ Data export
- ✅ Multi-tenancy & RLS
- ✅ Full API documentation
- ✅ Comprehensive UI/UX

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for full feature list.

## 🎯 Future Enhancements

- User invitations & tree sharing
- Batch import from CSV/Excel
- Photo uploads for people
- Family messaging/collaboration
- Timeline view (births, deaths, events)
- GEDCOM format import/export
- Mobile app (React Native)
- Advanced genealogy tools

## 📝 License

This project is private/proprietary. All rights reserved.

## 🤝 Contributing

This is currently a single-developer project. Contact for contribution inquiries.

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review [PROJECT_STATUS.md](./PROJECT_STATUS.md)
3. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. Open a GitHub issue

## 👨‍💻 Author

Built with ❤️ as a modern family tree solution.

---

**Last Updated:** October 2026  
**Version:** 1.0.0-alpha  
**Status:** Production Ready
