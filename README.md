# 🚀 DroidOS

**The Ultimate Local-First YouTube Live Stream Automation Workstation & Chatbot Engine**

[![Version](https://img.shields.io/badge/version-v2.1.5-purple.svg)](https://github.com/MRADDICTIVE27/DroidOS/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20x64-blue.svg)](https://github.com/MRADDICTIVE27/DroidOS/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-44.0.0-cyan.svg)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

Take complete control of your YouTube livestreams with automated chat intelligence, real-time OBS WebSocket integration, interactive chat games, Stream Deck hardware keys, loyalty rewards, and Discord cross-posting—all running 100% locally on your PC.

[Download Latest Release](https://github.com/MRADDICTIVE27/DroidOS/releases) • [Features](#-key-features) • [Installation](#-installation) • [Stream Deck](#-elgato-stream-deck-integration) • [Developer Guide](#-for-developers)

---

## 🌟 Why DroidOS?

Most streaming tools force you into monthly cloud subscriptions, harvest your viewer data, and run on distant servers with noticeable latency. 

**DroidOS is different.** It is built from the ground up as a native, local-first Windows workstation. Your configurations, credentials, viewer notes, economy balances, and custom commands remain exclusively on your computer.

---

## ✨ Key Features

### 🤖 Intelligent YouTube Live Chatbot
* **Dual-Account Support:** Operate with your primary Broadcaster account and a separate dedicated Bot account simultaneously.
* **Custom Bot Personalities:** Switch between distinct personalities (*Friendly*, *Sarcastic*, *Hype*, *Cyberpunk*, *Philosophical*) that dynamically color every automated response.
* **Smart Viewer Welcome Engine:** Automatically detects first-time viewers and returning regulars, greeting them with personalized welcome messages and cooldown protection.
* **Custom Commands & Timers:** Create powerful custom commands with argument parsing (`$user`, `$args`, `$points`, `$target`) and timed automated announcements.
* **API Quota Protection:** Real-time YouTube Data API v3 quota tracker that monitors request usage and dynamically pauses non-critical polling to prevent quota exhaustion.

### 🎥 Native OBS Studio WebSocket Integration (v5)
* **Real WebSocket Client:** Direct, authenticated communication with OBS Studio WebSocket v5 (`obs-websocket-js`).
* **Instant Scene Switching:** Switch program scenes directly from chat commands (e.g. `!scene Gameplay`) or as automatic triggers for channel point redeems.
* **Source & Filter Control:** Mute/unmute microphones, trigger media sources, and activate visual filter effects based on stream events.
* **Live Connection Diagnostics:** Automatic port detection, reconnection fail-safes, and status indicators in the native Windows title bar.

### 🎮 Interactive Chat Games & Live Boss Raids
* **Boss Raid Encounters (`!boss`, `!attack`):** Chat-wide cooperative boss fights featuring procedural robot avatars and real-time health bars rendered directly on your stream overlay.
* **Russian Roulette (`!rr <points>`):** High-stakes multi-round survival minigame with customizable risk progression, streak multipliers, and instant cash-outs.
* **Casino & Arcade Suite:** Built-in Slots (`!slots`), Bank Heist (`!heist`), Duel Arena (`!duel`), Coin Pusher (`!drop`), and Volcano.
* **Dynamic Win-Rate Sliders:** Broadcaster controls to tune payout frequencies and odds across all games from the workstation UI.

### 💰 Points Economy & Custom Redeems
* **Passive & Active Points:** Reward viewers automatically for watch time, active chat participation, new subscriptions, and Super Chat donations.
* **Custom Soundboard & Redeems:** Viewers can spend earned currency on audio soundboard triggers, OBS visual alerts, and stream events.
* **Leaderboards & Viewer Profiles:** In-depth viewer management tracking total watch time, messages sent, loyalty tier, and custom streamer notes.

### 🕹️ Elgato Stream Deck Integration
* **Dedicated Plugin:** Includes a custom Stream Deck plugin (`com.mradidictive.droidos.streamDeckPlugin`) for direct hardware control.
* **One-Click Actions:**
  * ⚔️ **Spawn Boss Raid:** Trigger or end boss encounters instantly.
  * 🧹 **Clear Chat Queue:** Instantly wipe backed-up automated messages during high-traffic moments.
  * 🔇 **Mute Audio Alerts:** Silence sound effects and alerts with a single button press.
  * 💎 **Give Points:** Grant bonus points to active chatters.
  * 🎭 **Switch Personality:** Change your chatbot's active tone on the fly.

### 💬 Discord Community Gateway
* **Live Broadcast Webhooks:** Automatically post customizable "Going Live" announcements to your Discord announcement channels.
* **Subscriber Alerts:** Forward YouTube subscriber notifications and Super Chat milestones to Discord in real time.
* **Cross-Platform Roles:** Sync Discord community roles and badges with your YouTube chat permissions.

### 🎨 Modular OBS Broadcast Overlay
* **Single Browser Source:** Add `http://localhost:3000/overlay.html` into OBS Studio as a hardware-accelerated browser source.
* **Live Preview Stage:** In-app overlay canvas allows streamers to preview, simulate events, and test overlay animations while offline.
* **XSS Sanitized:** All viewer names, messages, and titles are sanitized against injection attacks before rendering in OBS.

### 🛡️ Privacy & Backup Security
* **Workstation Backup & Restore:** Export your complete setup into a portable JSON backup. All sensitive tokens, OAuth client secrets, OBS passwords, and stream keys are automatically sanitized to prevent accidental credential leakage.
* **Safe Import Protection:** Restoring a backup never silently overwrites your existing live credentials with blank placeholders.

---

## 📥 Installation

1. Navigate to the **[Latest Release](https://github.com/MRADDICTIVE27/DroidOS/releases)** page.
2. Choose your preferred package:
   * **Installer (`DroidOS_Setup_vX.X.X.exe`):** Recommended for most users. Includes desktop shortcut and standard Windows setup wizard.
   * **Portable Executable (`DroidOS X.X.X.exe`):** Single standalone file. Runs immediately without installation.
   * **Portable ZIP (`DroidOS_vX.X.X_win64.zip`):** Complete folder containing unpacked binaries and launcher.
3. Launch DroidOS, follow the first-time setup prompt to name your bot, and connect your accounts in the **Settings** tab.

---

## 🕹️ Elgato Stream Deck Setup

To install the Stream Deck plugin:
1. Open DroidOS and navigate to the **Stream Deck** tab.
2. Click **Download Stream Deck Plugin** (or locate `public/downloads/com.mradidictive.droidos.streamDeckPlugin`).
3. Double-click the downloaded file to install it into the Elgato Stream Deck software.
4. Drag and drop any of the DroidOS action keys onto your canvas!

---

## 🛠️ For Developers

DroidOS is built with **Electron 44**, **React 19**, **Vite 6**, and **TypeScript 5.8**, using an embedded **Express** server backend.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* Windows 10/11 (x64)

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/MRADDICTIVE27/DroidOS.git
cd DroidOS

# 2. Install dependencies
npm install

# 3. Launch in development mode (with isolated .dev-data)
npm run dev
# or double-click: Start_DroidOS.bat
