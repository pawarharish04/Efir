# MongoDB Setup Guide for E-FIR Portal

## Option 1: MongoDB Atlas (Cloud - RECOMMENDED) ⭐

This is the **easiest and fastest** option - no local installation required!

### Steps:

1. **Go to MongoDB Atlas:**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for a FREE account

2. **Create a Free Cluster:**
   - Click "Build a Database"
   - Select **FREE** tier (M0)
   - Choose a cloud provider (AWS recommended)
   - Select region closest to you
   - Click "Create Cluster"

3. **Create Database User:**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `efir_user`
   - Password: `efir_password_2024` (or your own)
   - User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist Your IP:**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://efir_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update backend/.env:**
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://efir_user:efir_password_2024@cluster0.xxxxx.mongodb.net/efir_portal?retryWrites=true&w=majority
   JWT_SECRET=supersecretkey123
   NODE_ENV=development
   ```
   
   Replace `<password>` with your actual password and update the cluster URL.

7. **Restart Backend:**
   ```bash
   cd backend
   npm start
   ```

---

## Option 2: Install MongoDB Locally (Windows)

### Steps:

1. **Download MongoDB:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select "Windows" and download the MSI installer

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation:**
   ```bash
   mongod --version
   ```

4. **Start MongoDB Service:**
   - Open Services (Win + R → `services.msc`)
   - Find "MongoDB Server"
   - Right-click → Start

5. **Your .env is already configured:**
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/efir_portal
   ```

6. **Restart Backend:**
   ```bash
   cd backend
   npm start
   ```

---

## Option 3: Use MongoDB Docker Container (Requires Docker)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## Quick Test After Setup

Once MongoDB is connected, you should see in the backend terminal:
```
Server running on port 5000
MongoDB Connected: <your-connection-host>
```

If you see this, you're good to go! 🎉

---

## Recommended: MongoDB Atlas (Option 1)

**Why?**
- ✅ No installation required
- ✅ Free forever (512MB storage)
- ✅ Works from anywhere
- ✅ Automatic backups
- ✅ Cloud-hosted
- ✅ Takes only 5 minutes to set up

**Choose this if:** You want the fastest setup with zero local configuration.

---

## Need Help?

If you encounter issues:
1. Make sure your connection string is correct
2. Check that IP whitelist includes your IP
3. Verify username/password are correct
4. Ensure the database name is in the connection string

Let me know which option you'd like to use, and I can help you set it up!
