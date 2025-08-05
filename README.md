# PixieShelf Backend

A Node.js/Express backend server with MongoDB integration, featuring reverse proxy configuration for seamless development workflow.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend root directory:
```bash
# Database Configuration
MONGO_URL=mongodb://localhost:27017/pixieshelf_db
# Example for Atlas: mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority

# Server Configuration
PORT=3031
NODE_ENV=development
```

### 3. Database Setup
Ensure MongoDB is running and accessible. The application will automatically create the database and collections on first run.

### 4. Seed Data (Optional)
To populate the database with test users:
```bash
node seed-users.js
```

This creates:
- **Admin User**: `admin@example.com` / `admin123`
- **Member User**: `member@example.com` / `member123`

### 5. Start the Backend Server
```bash
npm run dev
```

The backend will start on `http://localhost:3031`

## 🔧 Development Workflow

### Reverse Proxy Configuration
The backend is configured as a reverse proxy for development:

- **API Routes** (`/api/*`): Handled directly by the backend
- **All Other Routes** (`/`, `/products`, `/login`, etc.): Proxied to the Vite dev server

### Complete Setup Process

1. **Start Backend First**:
   ```bash
   cd pixieshelf BE
   npm install
   npm run dev
   ```

2. **Start Frontend** (in a new terminal):
   ```bash
   cd pixieshelf FE
   npm install
   npm run dev
   ```

3. **Access Application**:
   - Primary URL: `http://localhost:3031`
   - Direct Frontend: `http://localhost:5173` (for direct access)

## 📁 Project Structure

```
pixieshelf BE/
├── server.js              # Main server file with reverse proxy
├── middleware/
│   └── auth.middleware.js # Authentication & authorization
├── services/
│   ├── db.service.js      # Database connection
│   ├── user.service.js    # User CRUD operations
│   └── product.service.js # Product CRUD operations
├── config/                # Configuration files
└── seed-users.js         # Database seeding script
```

## 🔐 Authentication & Authorization

### User Types
- **Admin**: Full access to all features including user management
- **Member**: Access to products (create, edit, delete) but not user management
- **Guest**: View-only access to products

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

#### Products (Protected)
- `GET /api/product` - Get all products
- `POST /api/product` - Create product (Member/Admin)
- `PUT /api/product/:id` - Update product (Member/Admin)
- `DELETE /api/product/:id` - Delete product (Member/Admin)

#### Users (Admin Only)
- `POST /api/user` - Create user
- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run seed        # Seed database with test users
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check your `MONGO_URL` in `.env`
   - Verify network connectivity

2. **Port Already in Use**:
   - Change `PORT` in `.env` file
   - Kill existing processes on port 3031

3. **Frontend Not Loading**:
   - Ensure Vite dev server is running on port 5173
   - Check proxy configuration in `server.js`

4. **Authentication Issues**:
   - Clear browser localStorage
   - Restart both backend and frontend servers

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in environment
2. Build the frontend: `npm run build` (in frontend directory)
3. The backend will serve static files from the built frontend
4. Configure your production MongoDB connection

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | Required |
| `PORT` | Server port | 3031 |
| `NODE_ENV` | Environment mode | development |


## 📄 License

This project is licensed under the MIT License. 