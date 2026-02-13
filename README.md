# 🎯 Complaint Management System (CMS)

<div align="center">

![CMS Banner](https://img.shields.io/badge/CMS-Complaint%20Management-blue?style=for-the-badge)
[![React](https://img.shields.io/badge/React-19. 1.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat)](LICENSE)

**A comprehensive web-based application designed to streamline customer complaint management from initial reporting to final resolution.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [User Roles](#-user-roles)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **Complaint Management System (CMS)** is a modern, enterprise-grade web application built to handle customer complaints efficiently across multiple organizational levels. It provides a seamless workflow for complaint submission, tracking, assignment, and resolution with real-time updates and comprehensive analytics.

### Why CMS?

- ✅ **Streamlined Workflow**: Clear process from complaint creation to resolution
- ✅ **Multi-Role Management**: Distinct user types with specific responsibilities
- ✅ **Real-Time Tracking**: Live status updates and notifications
- ✅ **Advanced Analytics**: Comprehensive reporting and data visualization
- ✅ **Location-Based Organization**: Geographic complaint management
- ✅ **Responsive Design**: Works seamlessly across all devices

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- Multi-role user authentication (Admin, Supplier, System Integrator, Customer)
- Secure JWT-based session management
- Role-based access control (RBAC)
- Protected routes with automatic redirection

### 📊 Complaint Management
- **Create & Submit**:  Rich complaint submission forms with file uploads
- **Status Tracking**:  Real-time complaint status monitoring
- **Priority Management**: LOW, MEDIUM, HIGH, URGENT priority levels
- **Category Organization**: Organized complaint categorization
- **Timeline View**: Complete complaint history and activity log
- **Bulk Operations**: Manage multiple complaints simultaneously

### 👥 User Management (Admin)
- User creation and management
- Role assignment and modification
- Location-based user organization
- User activity tracking

### 📍 Location Management
- Hierarchical location structure
- Location-based complaint routing
- Geographic analytics and reporting

### 📈 Analytics & Reporting
- **Dashboard Visualizations**: Charts and graphs using Recharts
- **Status Distribution**: Pie charts for complaint status overview
- **Trend Analysis**: Line and bar charts for temporal analysis
- **Export Capabilities**: PDF and Excel export functionality
- **Custom Reports**: Filterable and searchable data tables

### 🌐 Internationalization (i18n)
- Multi-language support infrastructure
- Language detection and switching
- Translation management system

### 🎨 UI/UX Features
- **Dark Mode**: Full dark theme support
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Components**: Using Headless UI and Heroicons
- **Toast Notifications**: Real-time feedback with react-hot-toast
- **Loading States**: Smooth loading animations
- **File Preview**: PDF and document viewing capabilities

### 🔔 Notifications
- Real-time toast notifications
- Status change alerts
- System notifications

---

## 🛠 Tech Stack

### Frontend Framework
- **React 19.1.1** - Modern UI library
- **React Router DOM 7.8.2** - Client-side routing
- **Vite 7.1.2** - Lightning-fast build tool

### Styling & UI
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS transformation
- **Headless UI 2.2.7** - Unstyled, accessible components
- **Heroicons 2.2.0** - Beautiful hand-crafted SVG icons
- **Lucide React 0.542.0** - Icon library

### Data Visualization
- **Recharts 3.2.1** - Composable charting library

### File Handling
- **jsPDF 2.5.2** - PDF generation
- **jsPDF-AutoTable 3.8.4** - Table generation for PDFs
- **React PDF 10.1.0** - PDF viewing
- **XLSX 0.18.5** - Excel file handling

### API & State Management
- **Axios 1.12.2** - HTTP client
- **React Context API** - State management

### Internationalization
- **i18next 25.6.0** - Internationalization framework
- **react-i18next 16.2.0** - React integration
- **i18next-browser-languagedetector 8.2.0** - Language detection

### Utilities
- **date-fns 4.1.0** - Date manipulation
- **React Hot Toast 2.6.0** - Toast notifications
- **React Toastify 11.0.5** - Alternative notifications

### Development Tools
- **ESLint 9.33.0** - Code linting
- **TypeScript Types** - Type definitions for React
- **Autoprefixer 10.4.21** - CSS vendor prefixing

---

## 🏗 Architecture

### Component Structure

```
CMS Frontend
│
├── Authentication Layer
│   ├── Login/Register
│   └── Protected Routes
│
├── Role-Based Layouts
│   ├── Admin Layout
│   ├── Supplier Layout
│   ├── System Integrator Layout
│   └── Customer Layout
│
├── Core Features
│   ├── Complaint Management
│   ├── User Management
│   ├── Location Management
│   └── Reporting & Analytics
│
└── Shared Components
    ├── Forms & Inputs
    ├── Data Tables
    ├── Modals & Dialogs
    ├── Charts & Visualizations
    └── File Handling
```

### User Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Login     │────>│ Role Check   │────>│ Role Dashboard  │
└─────────────┘     └──────────────┘     └─────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼───┐          ┌────▼────┐       ┌─────▼──────┐
    │ Admin │          │Supplier │       │ Customer   │
    └───────┘          └─────────┘       └────────────┘
        │                   │                   │
    ┌───▼──────────┐   ┌────▼─────────┐  ┌─────▼──────────┐
    │ Manage All   │   │ Manage Own   │  │ Submit & Track │
    │ System       │   │ Complaints   │  │ Complaints     │
    └──────────────┘   └──────────────┘  └────────────────┘
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/jassalarjan/cms-frontend.git
   cd cms-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_APP_NAME=Complaint Management System
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

---

## ⚙️ Configuration

### Vite Configuration

The project uses Vite for fast development and optimized production builds.  Configuration is in `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Additional configuration
})
```

### Tailwind Configuration

Tailwind CSS is configured in `tailwind.config.js` with custom theme extensions and dark mode support. 

### ESLint Configuration

Code quality is maintained through ESLint configuration in `eslint.config.js`.

---

## 💻 Usage

### Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```
   Access at `http://localhost:5173`

2. **Production Build**
   ```bash
   npm run build
   npm run preview
   ```

### Default User Roles

After initial setup, you can create users with the following roles:

- **ADMIN**: Full system access
- **SUPPLIER**:  Manage supplier-related complaints
- **SYSTEM_INTEGRATOR**: Submit and track complaints
- **CUSTOMER**: Basic complaint submission and tracking

---

## 👤 User Roles

### 🔴 Admin
**Full System Control**
- Dashboard with comprehensive analytics
- User management (create, update, delete users)
- Location management (create, organize locations)
- Complaint management (view all, assign, update status)
- Advanced reporting and data export
- System configuration

**Navigation:**
- Dashboard
- Users Management
- Locations Management
- All Complaints
- Advanced Reports

### 🟢 Supplier
**Supplier Operations**
- View assigned complaints
- Update complaint status
- Add responses and comments
- Track complaint resolution
- Supplier-specific analytics

**Navigation:**
- Home/Dashboard
- My Complaints

### 🔵 System Integrator
**Complaint Submission & Tracking**
- Create new complaints with detailed information
- Upload supporting documents
- Track complaint status in real-time
- View complaint timeline and history
- Receive notifications on status changes

**Navigation:**
- Dashboard
- My Complaints
- Create Complaint

### 🟡 Customer
**Basic Complaint Management**
- Submit complaints
- Track own complaints
- View complaint details
- Receive updates

**Navigation:**
- My Complaints
- Create New Complaint

---

## 📁 Project Structure

```
cms-frontend/
│
├── public/                  # Static assets
│   ├── logo.png
│   ├── logo1.png
│   └── favicon.ico
│
├── src/
│   ├── api/                 # API configuration
│   │   └── axios. js         # Axios instance with interceptors
│   │
│   ├── assets/              # Images, fonts, etc.
│   │
│   ├── components/          # Reusable components
│   │   ├── BulkActions.jsx  # Bulk operations component
│   │   ├── ComplaintForm.jsx # Complaint submission form
│   │   ├── DataTable.jsx    # Reusable data table
│   │   ├── FileUpload.jsx   # File upload handler
│   │   ├── Flowchart.jsx    # Workflow visualization
│   │   ├── FormInput.jsx    # Form input component
│   │   ├── Loading.jsx      # Loading spinner
│   │   ├── LocationSelect.jsx # Location selector
│   │   ├── Modal.jsx        # Modal dialog
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── PDFViewer.jsx    # PDF document viewer
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   ├── Timeline.jsx     # Activity timeline
│   │   └── UserForm.jsx     # User management form
│   │
│   ├── context/             # React Context
│   │   └── AuthContext.jsx  # Authentication context
│   │
│   ├── layouts/             # Layout components
│   │   ├── AdminLayout.jsx
│   │   ├── SupplierLayout.jsx
│   │   ├── SystemIntegratorLayout.jsx
│   │   └── CustomerLayout.jsx
│   │
│   ├── pages/               # Page components
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminComplaints.jsx
│   │   │   ├── AdminLocations.jsx
│   │   │   └── AdvancedReports.jsx
│   │   │
│   │   ├── supplier/
│   │   │   ├── SupplierHome.jsx
│   │   │   └── SupplierCreate.jsx
│   │   │
│   │   ├── customer/
│   │   │   ├── CustomerHome.jsx
│   │   │   └── CustomerCreate.jsx
│   │   │
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── UserGuide.jsx
│   │   └── FlowchartPage.jsx
│   │
│   ├── routes/              # Route configuration
│   │   └── AdminRoutes.jsx
│   │
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   └── i18n.js              # Internationalization config
│
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # This file
```

---

## 🔌 API Integration

### API Configuration

The application uses Axios for HTTP requests with a configured instance in `src/api/axios.js`:

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env. VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
API.interceptors.request. use(
  (config) => {
    const token = localStorage. getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
```

### API Endpoints (Expected)

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

#### Complaints
- `GET /complaints` - Get all complaints
- `GET /complaints/: id` - Get complaint by ID
- `POST /complaints` - Create new complaint
- `PUT /complaints/:id` - Update complaint
- `DELETE /complaints/:id` - Delete complaint

#### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Locations
- `GET /locations` - Get all locations
- `POST /locations` - Create location
- `PUT /locations/:id` - Update location

---

## 🎨 Component Examples

### Creating a Complaint

```jsx
import ComplaintForm from './components/ComplaintForm';

function CreateComplaintPage() {
  const handleSuccess = () => {
    toast.success('Complaint created successfully! ');
  };

  return (
    <ComplaintForm 
      supplierId={currentUser.id}
      onSuccess={handleSuccess}
    />
  );
}
```

### Using DataTable

```jsx
import DataTable from './components/DataTable';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
];

<DataTable
  columns={columns}
  data={complaints}
  onRowClick={handleRowClick}
  isLoading={loading}
/>
```

---

## 📚 Documentation

### In-App Documentation

The application includes built-in documentation:

- **User Guide**: Accessible at `/user-guide`
  - System overview
  - Role-specific instructions
  - Feature walkthrough
  - FAQs

- **Workflow Flowchart**: Accessible at `/flowchart`
  - Visual workflow representation
  - Step-by-step process explanation
  - Role interactions

### Component Documentation

Each major component includes inline JSDoc comments for better developer experience. 

---

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking (if TypeScript)
npm run type-check
```

---

## 🚢 Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options

1. **Vercel**: Connect your GitHub repository for automatic deployments
2. **Netlify**: Drag and drop the `dist` folder or connect via Git
3. **Docker**: Create a Docker image for containerized deployment
4. **Traditional Hosting**: Upload the `dist` folder to your web server

### Environment Variables for Production

Ensure these are set in your production environment:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=Complaint Management System
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Jassal Arjan**

- GitHub: [@jassalarjan](https://github.com/jassalarjan)
- Repository: [cms-frontend](https://github.com/jassalarjan/cms-frontend)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Headless UI for accessible components
- Recharts for beautiful visualizations
- All contributors and supporters

---

## 📞 Support

For support, issues, or feature requests:

- Open an issue on [GitHub Issues](https://github.com/jassalarjan/cms-frontend/issues)
- Contact the development team

---

## 🗺 Roadmap

### Planned Features

- [ ] Real-time notifications with WebSocket
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Mobile application
- [ ] Integration with external ticketing systems
- [ ] AI-powered complaint categorization
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] API documentation with Swagger
- [ ] Comprehensive test coverage

---

<div align="center">

**Built with ❤️ by the CMS Development Team**

⭐ **Star this repository if you find it helpful!** ⭐

</div>
