# 🚀 DroidOS

**A powerful, local-first ChatBot and stream control workstation for YouTube creators.**

DroidOS is a standalone Windows desktop application designed to take your YouTube livestreams to the next level. It acts as an all-in-one automation hub featuring custom chatbot commands, unique viewer profiles, a full points economy system, and interactive redeemable rewards.

---

## ✨ Key Features

* **🤖 Smart YouTube ChatBot:** Fully automated chatbot with customizable bot personalities.
* **👤 Advanced Viewer Profiles:** Track viewer stats, create custom notes, and trigger unique, personalized bot responses for specific subscribers.
* **💰 Points & Economy System:** Reward your viewers with a built-in virtual currency that they can earn by watching and chatting.
* **🎁 Custom Redeems & Rewards:** Let viewers spend their earned points on interactive stream events.
* **🎮 Chat Games:** Engage your audience with built-in chat games (boss fights, trivia, and more).
* **⚡ OBS Integration:** Seamlessly connect to OBS WebSocket to trigger scenes, sources, and effects directly from chat commands.
* **⚙️ 100% Local Data:** Your settings, viewer data, and tokens are stored entirely locally on your machine—no mandatory cloud subscriptions required.

## 📥 Installation

1. Go to the [Releases page](https://github.com/MRADDICTIVE27/DroidOS/releases).
2. Download the latest `DroidOS_Setup_vX.X.X.exe`.
3. Run the installer to add DroidOS to your computer.
4. Launch the app, log in to your YouTube broadcaster and bot accounts via the Settings tab, and you're good to go!

*(Portable versions are also available in the Releases section if you prefer not to install the app).*

## 🛠️ For Developers

DroidOS is built using **Electron**, **React**, **Vite**, and **TypeScript**.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* Git

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/MRADDICTIVE27/DroidOS.git
   cd DroidOS
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```

### Building the Windows Executable
To package the app into a standalone `.exe` file, you can run the included build script:
```bash
# Simply double click this script from your File Explorer:
release\Build_Windows_EXE.bat
```
*(This will compile the app and output the final installers and portable zip files into the `release/` folder).*

---

## 🤝 Contributing
Pull requests are welcome! If you'd like to add new chat games, improve the OBS integration, or squash bugs, feel free to fork the repository and submit a PR.

## 📝 License
This project is licensed under the MIT License.
