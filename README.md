# DroidOS v1.1.0

![DroidOS](https://img.shields.io/badge/DroidOS-v1.1.0-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![License](https://img.shields.io/badge/License-Proprietary-red)

An intelligent YouTube chat bot with Custom responses, role-based interactions, viewer profiles, and powerful automation features.

## ✨ Key Features

### 🎭 Role-Based Response System
- **Different responses for different user roles**
- Owners, moderators, VIPs, and custom roles get exclusive responses
- Create unlimited custom roles with unique response sets
- Casual viewers never see exclusive role responses

### 🤖 Dynamic Bot Identity
- Bot knows its own name and adapts responses accordingly
- Streamer name integration throughout the system
- Automatic YouTube channel name detection
- Customizable bot personality and responses

### 👥 Advanced User Management
- Comprehensive viewer profiles with custom facts
- Role-based permission system (owner, mod, VIP, custom)
- Memory system that remembers viewer interactions
- Activity tracking and analytics

### 🎨 Modern Professional UI
- Glass rounded icons and tabs with smooth styling
- Responsive text display that prevents cutoff
- Dark/light theme support
- Professional footer with proper alignment

### 🔄 Automatic Updates
- Built-in GitHub integration for seamless updates
- One-click update installation from within the app
- User data preservation during updates
- Automatic version checking

## 🚀 Quick Start

### Installation
1. **Download the latest release** from [GitHub Releases](https://github.com/MRADDICTIVE27/DroidOS/releases)
2. **Extract the ZIP file** to your desired location
3. **Run the app** by double-clicking `Start DroidOS.bat` or `portable_launcher.cmd`
4. **Accept the startup agreement** when prompted

### YouTube Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create OAuth 2.0 credentials (Desktop application)
5. Download the client secrets JSON file
6. Rename it to `client_secret.json` and place it in the `Youtube/` folder

### Initial Configuration
- Set your bot name in **Bot Identity** settings
- Configure owner and moderator usernames in **Profiles** tab
- Customize personality responses in the `responses/` folder
- Create custom roles in the **Profiles** tab

## 🎯 Role System

### Built-in Roles
- **Owner**: Full control, exclusive responses, special recognition
- **Moderator**: Dedicated greetings and question responses
- **VIP**: Priority responses and special acknowledgment
- **Viewer**: Standard responses

### Custom Roles
- Create unlimited custom roles (e.g., "Subscriber", "Elite", "Legend")
- Each role gets its own response files
- Auto-generated response templates for easy customization
- Dynamic role assignment through the UI

### Response Priority
1. Custom role files (highest priority)
2. Standard role files
3. Profile-based responses
4. Default responses (fallback)

## 📁 Configuration Files

### YouTube Credentials
- `Youtube/client_secret.json` - Your OAuth client secrets (REQUIRED)
- `Youtube/token.json` - Auto-generated access tokens
- `Youtube/bot_token.json` - Auto-generated bot tokens

Example files are provided (`client_secret.json.example`, etc.)

### Response Files
- `responses/owner_greetings.txt` - Owner-exclusive greetings
- `responses/mod_greetings.txt` - Moderator greetings
- `responses/vip_greetings.txt` - VIP greetings
- `responses/custom_[role]_greetings.txt` - Custom role greetings
- `responses/[role]_questions.txt` - Role-specific question responses

### Permissions
- `Main/permissions.py` - Configure role assignments

### Settings
- `data/settings.json` - App settings (auto-generated)

## 🔄 Update System

### Automatic Updates
- App checks GitHub Releases API for new versions
- In-app notifications when updates are available
- One-click update installation
- **User data is always preserved**

### Preserved Data
- `data/` - Settings, bot name, custom configurations
- `Youtube/data/` - Chat history and stream data
- `Youtube/client_secret.json` - Your credentials
- `Youtube/token.json` - Access tokens
- `.mr_droidbot_accepted` - Agreement status

### Updated Content
- Python code files
- Response templates
- AI configurations
- Bug fixes and new features

## 🛠️ Developer Guide

### Creating Releases
1. Update version in `app.py`: `APP_VERSION = "X.X.X"`
2. Run `python create_release.py` to generate clean ZIP
3. Commit changes: `git add . && git commit -m "Release vX.X.X"`
4. Push to GitHub: `git push origin main`
5. Create GitHub release with proper description
6. Attach the generated ZIP file

### Documentation
- **GitHub Setup**: See `GITHUB_SETUP_GUIDE.md`
- **Quick Updates**: See `QUICK_UPDATE_GUIDE.md`
- **Code Comments**: Detailed inline documentation

### Release Script
The `create_release.py` script automatically excludes:
- Personal credentials
- User data
- Development files
- Temporary files

## 📋 Requirements

- **Python 3.11 or newer**
- **Windows OS** (primary platform)
- **Google OAuth credentials** for YouTube integration

## 🆘 Support

- **Issues & Feature Requests**: [GitHub Issues](https://github.com/MRADDICTIVE27/DroidOS/issues)
- **Documentation**: Check inline code comments and guide files
- **GitHub Repository**: [MRADDICTIVE27/DroidOS](https://github.com/MRADDICTIVE27/DroidOS)

## 📝 Changelog

### v1.1.0
- ✨ Role-based response system with custom roles
- 🎨 Professional UI with glass rounded icons/tabs
- 🤖 Dynamic bot identity integration
- 📱 Fixed text truncation issues
- 🔄 Enhanced permissions system
- 📚 Comprehensive documentation

## 📄 License

© 2026 MRADDICTIVE Studios. All rights reserved.

---

**Developed with ❤️ by MRADDICTIVE Studios**
