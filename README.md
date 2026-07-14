# BookStore — Online Book Shopping Platform

A modern, clean, and full-stack MERN (MongoDB, Express, React, Node.js) web application representing a college mini-project. It includes user shopping, reservations, eBook downloads, and an extensive admin management panel.

---

## 🌟 Key Features

### 📖 Reader / Student Flow
- **Clean Catalog**: Search, pagination, filter, and sorting for physical books and eBooks.
- **Shopping Cart & Wishlist**: Add items, adjust quantities, calculate shipping thresholds, and move items.
- **Secure Checkout**: Choose between Cash on Delivery and online payments via Razorpay Test Mode modal.
- **User Profile**: Edit personal details, upload avatar images, and manage delivery addresses.
- **Library Tracker**: Track reading completion percentages for eBooks with a visual progress bar.
- **Hold Reservations**: Place reservations on out-of-stock items and get notified when they are replenished.
- **Digital Shelf**: Access download links for purchased digital eBooks.
- **Ratings & Reviews**: Write reviews and ratings which recalculate book score averages automatically.

### 📊 Admin Panel Flow
- **Operational Dashboard**: Render total users, revenue charts, category distributions, and recent orders.
- **Catalog Management**: Add/Edit/Delete books, export catalogs, and import books via CSV files.
- **Genre Management**: Add/Edit/Delete book genres using responsive modals.
- **Order Dispatch**: Review customer shipping addresses and update shipping statuses.
- **Account Controls**: Review user lists, change system roles, and block/activate accounts.
- **Notice Bulletin**: Create global announcements visible to users at the top of the store page.
- **System Activity Log**: Trace user signups and checkout payments.

---

## 🛠️ Technology Stack
- **Database**: MongoDB & Mongoose Schemas
- **Backend API**: Node.js & Express Framework
- **Frontend App**: React.js, React Router v6, Context API, Hooks
- **Styling**: Bootstrap 5.3.2 (Clean Modern Light Theme)
- **Integrations**: Razorpay SDK, Cloudinary Image storage, SMTP Mailers

---

## 🚀 Getting Started

### 📋 Prerequisites
- Install [Node.js](https://nodejs.org) (v16+)
- Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) locally and ensure it is running at `mongodb://localhost:27017`

### 🔧 Installation & Setup

1. **Clone and open workspace**:
   ```bash
   cd BOOKSTORE
   ```

2. **Setup Server Configs**:
   - Rename `server/.env.example` to `server/.env` and update credentials.
   - Run installation:
     ```bash
     cd server
     npm install
     ```

3. **Seed Database**:
   - Populates database with 25 categories, 50 detailed books, admin account, and mock user.
   - Run seed command:
     ```bash
     npm run seed
     ```

4. **Setup Client Configs**:
   ```bash
   cd ../client
   npm install
   ```

### 🏃 Running the Application

1. **Start Express Server**:
   ```bash
   cd server
   npm run dev
   ```
   *Runs at `http://localhost:5000`*

2. **Start React App**:
   ```bash
   cd client
   npm start
   ```
   *Runs at `http://localhost:3000`*

---

## 🔑 Demo Account Credentials
- **Admin**: `admin@bookstore.com` / `admin123`
- **User**: `user@bookstore.com` / `user123`
