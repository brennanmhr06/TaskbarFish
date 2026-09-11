# 🐠 TaskbarFish

A beautiful desktop aquarium application that lives on your Windows taskbar! Watch pixel-art fish swim, chase algae, and grow in a transparent, always-on-top window. ✨

![TaskbarFish](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Electron](https://img.shields.io/badge/Electron-28.3.3-9BE349.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-3178C6.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)

## 🌟 Features

- **🎨 Pixel-Art Aquarium** - Beautiful animated fish, plants, and algae in a glass tank
- **🪟 Always-on-Top** - Transparent window that sits on your Windows taskbar
- **🐟 Fish Behavior** - Fish swim, chase algae, and eat to gain XP
- **📊 XP & Leveling System** - Watch your fish grow and level up as they eat
- **👤 User Authentication** - Sign up and login to save your aquarium progress
- **💾 Cloud Persistence** - Your aquarium state is saved to MongoDB
- **🎵 Background Music** - Relaxing ambient music while you watch your fish
- **🖱️ Interactive** - Drag to position, resize the tank, and expand the menu
- **🔒 Secure** - Password hashing with scrypt, secure Electron setup

## 🛠️ Technology Stack

- **⚡ Electron** - Desktop application framework
- **⚛️ React** - UI framework
- **📘 TypeScript** - Type-safe JavaScript
- **🗄️ MongoDB** - Database for user data and state persistence
- **🔐 scrypt** - Secure password hashing
- **📦 Webpack** - Module bundler

## 📋 Prerequisites

Before running TaskbarFish, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Either:
  - Local MongoDB instance running on your machine
  - MongoDB Atlas cloud database account
- **npm** (comes with Node.js)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd TaskbarFish
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the project root with your MongoDB connection string:
   ```env
   MONGO=mongodb://localhost:27017/taskbarfish
   ```
   
   For MongoDB Atlas, use your connection string:
   ```env
   MONGO=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskbarfish
   ```

## 🎮 Running the Project

### Development Mode
Run the app with hot-reloading and development tools:
```bash
npm run dev
```

### Production Build
Build the optimized production version:
```bash
npm run build
```

### Start Electron Only
Start Electron without rebuilding (requires previous build):
```bash
npm start
```

## 📖 Usage Guide

### First Time Setup

1. **Launch the app** - Run `npm run dev` to start TaskbarFish
2. **Sign Up** - Create an account with username, email, and password
3. **Watch your aquarium** - The transparent window will appear on your taskbar

### Interacting with Your Aquarium

- **🖱️ Drag the window** - Click and drag anywhere on the aquarium to reposition it
- **📏 Resize the tank** - Drag the right edge to resize (300-1200px width, 80-420px height)
- **📋 Expand menu** - Click the menu button to see stats, XP, and fish slots
- **🐟 Feed your fish** - Algae spawns automatically; fish will chase and eat it
- **📊 Track progress** - Watch your fish gain XP and level up!

### Saving Your Progress

- Your aquarium state saves automatically every 5 seconds to MongoDB
- Your session is saved locally for auto-login on next launch
- Fish XP, tank size, and other settings persist across sessions

## 🔧 Configuration

### MongoDB Setup

**Local MongoDB:**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod --dbpath /path/to/your/data
```

**MongoDB Atlas:**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env` file

### Window Settings

Default window settings (can be modified in `src/main.ts`):
- Width: 600px
- Height: 200px
- Always on top: ✅
- Frameless: ✅
- Transparent: ✅

## 🎨 Customization

### Tank Size
- Minimum width: 300px
- Maximum width: 1200px
- Minimum height: 80px
- Maximum height: 420px

### Fish Behavior
- Algae spawns every 5 seconds (max 15)
- Fish get full after eating max algae
- Full duration: 3 minutes
- XP calculation: Level n requires n*100 XP

##  Troubleshooting

### Electron Won't Start
```bash
# Rebuild Electron
npm install electron --force
```

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

If you encounter any issues or have questions, please open an issue on the repository.

## 🎉 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://reactjs.org/)
- Database by [MongoDB](https://www.mongodb.com/)
- Pixel-art inspired by retro gaming aesthetics

---

Made with ❤️ and lots of 🐠
