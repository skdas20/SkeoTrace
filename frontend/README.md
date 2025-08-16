# Organic Food Traceability - Frontend

A minimal React (Vite + TypeScript) SPA for tracking organic food from farm to table with role-based access control.

## Features

- **Clean UI** with Tailwind CSS and shadcn/ui components
- **Role-based Authentication** (Producer, Retailer, Consumer, Admin)
- **Dashboard per Role** with essential actions only
- **Public Trace Page** accessible via QR codes
- **Real-time Blockchain Verification**
- **Beautiful Timeline** for batch history

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Zustand** for state management
- **React Router** for navigation
- **Lucide React** for icons

## Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on port 5000

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Configuration

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:5000
```

## Demo Credentials

Use these credentials to test different roles:

- **Producer**: `prod@trace.local` / `Prod@123`
- **Retailer**: `shop@trace.local` / `Retail@123`
- **Admin**: `admin@trace.local` / `Admin@123`
- **Consumer**: `cons@trace.local` / `Cons@123`

## Application Routes

- `/login` - Authentication page
- `/producer` - Producer dashboard (requires PRODUCER role)
- `/retailer` - Retailer dashboard (requires RETAILER role)  
- `/admin` - Admin dashboard (requires ADMIN role)
- `/trace/:batchId` - Public traceability page (no auth required)

## Role-Based Features

### Producer Dashboard
- Create new organic food batches
- View and manage existing batches
- Update harvest dates and certification info
- Transfer batches to retailers

### Retailer Dashboard
- Search for batches by ID
- Receive transferred batches
- Move batches to storage
- Mark batches as sold

### Admin Dashboard
- View all system users
- Verify blockchain integrity
- Audit batch history
- Monitor system blocks

### Public Trace Page
- View complete batch information
- See chain of custody timeline
- Verify blockchain integrity
- Access via QR codes
- Share trace links

## API Integration

The frontend communicates with the backend API for:

- **Authentication**: JWT-based login
- **Batch Management**: CRUD operations
- **Blockchain Operations**: Verification and audit
- **Public Tracing**: No-auth batch lookup
- **QR Code Generation**: Dynamic QR codes

## Building for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## Development

```bash
# Start with hot reload
npm run dev

# Run type checking
npm run build

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Nav.tsx         # Navigation component
│   ├── Protected.tsx   # Route protection
│   └── Timeline.tsx    # Event timeline
├── pages/              # Page components
│   ├── Login.tsx       # Authentication
│   ├── Dashboard*.tsx  # Role-specific dashboards
│   ├── PublicTrace.tsx # Public traceability
│   └── NotFound.tsx    # 404 page
├── lib/                # Utilities
│   ├── api.ts          # API client
│   ├── auth.ts         # Auth utilities
│   └── utils.ts        # Common utilities
├── store/              # State management
│   └── auth.ts         # Auth store (Zustand)
├── styles/             # Global styles
│   └── index.css       # Tailwind + CSS variables
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Features in Detail

### Responsive Design
- Mobile-first approach
- Clean, minimal interface
- Optimized for 10-minute demos

### Security
- JWT token storage
- Role-based route protection
- Secure API communication

### User Experience
- Loading states for all operations
- Error handling with user feedback
- Intuitive navigation
- Copy-to-clipboard functionality

### Blockchain Integration
- Real-time integrity verification
- Visual indicators for verification status
- Complete audit trails
- Immutable event logging

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
