# DroidOS v2.0.0 Release Notes

We are thrilled to announce the official release of **DroidOS v2.0.0**, a complete overhaul of the ultimate local-first YouTube stream automation workstation and chatbot engine.

This release focuses on bringing immersive OBS broadcast overlays, rich visual chat games, real-time donation monetization, robust data integrity, and a polished Windows installer experience.

---

## 🚀 Key Highlights & New Features

### 1. YouTube Super Chat & Sponsor Membership Integration
* **Monetization Triggers**: Automatically listens for YouTube `superChatEvent` and `newSponsorEvent` payloads.
* **Confetti Broadcast Popups**: Triggers high-contrast celebration banners on your OBS overlay (including gold alerts for Super Chats and custom green welcome cards for new members).
* **Loyalty Points Rewards**: Converts Super Chat donations directly to stream currency (defaults to 100 points per dollar donated) and grants 500 bonus points for member sign-ups.
* **Live Chat Monitors**: Displays Super Chats as glowing amber cards, membership milestones as glowing green cards, and shows real YouTube user profile pictures.
* **Event Simulator**: Supports testing Super Chat and membership chimes while offline directly from the in-app chat simulator.

### 2. Immersive OBS Overlays & Chat Games
* **Animated Minigames**: Integrated keyframe-based CSS animations for slots, heist, and duel mini-challenges directly into the OBS overlay.
* **Custom Raid Bosses**: Boss fights now spawn randomly-seeded robot avatars along with dynamic health bars on stream.
* **Subscriber Achievements**: Supports displaying `{username} just subscribed!` achievement notification banners in OBS when triggers match.

### 3. Broadcaster Dashboard & Data Integrity
* **Live YouTube Stream Statistics**: The dashboard displays real-time live subscribers, active viewers count, and stream titles fetched via YouTube API.
* **Sign-In Detail Safeguard**: Added state guards (`!isLoadingData`) to the auto-saving thread. Your custom OAuth client secrets, access tokens, timers, and command databases will never be overwritten by defaults on load.
* **Local AppData Explorer**: An in-app file inspector modal allows you to browse, search, copy paths, and edit local settings JSONs in `%APPDATA%\Local\DroidOS`.

### 4. Help Q&A Hub
* Added an interactive, card-based **Help Q&A** tab inside DroidOS. Includes comprehensive setup guides on Google Cloud credentials, required JavaScript origins (`http://localhost:3000`), redirect URIs, separate chatbot profiles, and OBS WebSocket troubleshooting.

---

## 🛠️ Performance & Packaging Fixes
* **Conditional DevTools**: Developer console is now hidden on load in release builds, only opening in developer/development builds.
* **Wizard Installer**: Updated NSIS installer config (`package.json`) to run as a standard step-by-step setup wizard instead of a silent 1-click install, ensuring desktop/start menu shortcuts are reliably created and preventing the "Installing..." progress bar on subsequent launches.
* **Private Channel Polling**: Overhauled live chat connection filters to query broadcasts with `mine=true` to ensure the chatbot successfully links to private and unlisted scheduled streams.
* **Economy Economy Quick Resets**: Added quick buttons to "Clear Chat" and "Reset All Points" for all users with confirmation screens.
