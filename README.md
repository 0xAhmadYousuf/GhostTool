# GhostTool // Developer Utility Hub

GhostTool is a lightweight, all-in-one standalone utility hub built for developers, designers, and power users. Created by **0xAhmadYousuf**, it's designed as a single-page local desktop application with a cyberpunk-inspired dark CRT aesthetic. It consolidates 23 essential tools into one blazing fast interface—no cloud dependencies, no tracking, and everything happens instantly on your machine.

## Features

- **Blazing Fast & Local:** Entirely powered by a lightweight Flask backend and PyWebView frontend. No cloud latency.
- **Always On Top:** Pin the app above all other windows with a single click.
- **Customizable UI:** Built-in settings control panel for scaling UI size and adjusting brightness to match your environment.
- **No Console Clutter:** The app runs silently without splashing terminal windows in the background.

## The Toolbox (23 Tools Included)

### 💻 Developer Tools
- **Code Diff Viewer:** Compare two blocks of code cleanly using Inline or Unified modes.
- **JSON Formatter:** Format, minify, un-minify, and validate JSON payloads instantly.
- **Regex Tester:** Test JavaScript regular expressions with highlighting and presets (Email, URL, IP).
- **Hash Generator:** Compute MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly (using Web Crypto API).
- **Base64 Encode/Decode:** Two-way Base64 encoding.
- **URL Encode/Decode:** Safely encode or decode URL components.
- **Case Converter:** Instantly switch text between camelCase, snake_case, CONSTANT_CASE, kebab-case, and Title Case.
- **HTTP Status Codes:** A fast, searchable reference guide for standard HTTP status codes.

### 🎨 Design & Authoring
- **Color Picker:** Hex, RGB, and HSL converter with a swatches palette.
- **Markdown Preview:** Write markdown with a live rendered preview and instantly copy the generated HTML.
- **Lorem Ipsum Generator:** Generate placeholder text by words, sentences, or paragraphs.

### ⏰ Time & Productivity
- **Pomodoro / Focus Mode:** Stay focused with 25-minute sprints, short/long breaks, or custom flow states. Includes a full-screen distraction-free overlay.
- **Stopwatch:** Standard stopwatch with lap tracking.
- **World Clocks:** Track timezones from New York to Tokyo. Completely customizable and removable.
- **Unix Timestamp Converter:** Instantly convert Unix timestamps into human-readable local and global times.
- **System Metrics:** Live uptime tracker and quick-copy current Unix timestamp.
- **Persistent Notes:** A scratchpad for pasting quick queries or reminders—autosaves locally to the browser.
- **Quick Calculator:** On-the-fly math evaluator that displays the result along with Hex, Octal, and Binary conversions.

### ⚡ System Automation
- **Shutdown Timer:** Set your PC to shutdown gracefully after X hours/minutes.
- **Schedule Shutdown:** Select an exact time of day for your system to shutdown.
- **Countdown Timer:** Countdown to a specific date/time in the future.

### 🔒 Security
- **Password Generator:** Securely generate random passwords and tokens with exact character rules and a strength meter. Can also generate bulk batches and UUIDs.

## Installation & Running

### Requirements
- Python 3.10+
- OS: Windows, macOS, or Linux

### Setup
Run the following command to install the required libraries (`Flask` and `pywebview`). GhostTool will automatically attempt to install these on the first run, but you can install them manually:

```bash
pip install flask pywebview
```

### Launch
To open GhostTool, run the main Python script:

```bash
python main.py
```

It will launch a native desktop window. All Python console logs have been suppressed for a cleaner user experience. Ensure `static/a.ico` is in the same directory for the app icon to display properly.

## Tech Stack
- **Backend:** Python 3, Flask, PyWebView
- **Frontend:** HTML5, Vanilla JavaScript, Vanilla CSS
- **Design:** Single-page architecture (SPA), custom theming (`JetBrains Mono` font), custom SVG iconography.

## License
MIT License.
