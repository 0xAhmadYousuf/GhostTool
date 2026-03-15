<div align="center">
  <img src="assets/logo.svg" width="220" height="220" alt="GhostTool Logo">
  <h1>GhostTool</h1>
  <p><i>A powerful, offline, all-in-one utility hub for everyone.</i></p>

  <!-- Badges -->
  <a href="https://github.com/0xAhmadYousuf/GhostTool/releases/tag/v0.0.1-beta"><img src="https://img.shields.io/badge/version-v0.0.1--beta-ff7722?style=for-the-badge" alt="Version"></a>
  <a href="https://github.com/0xAhmadYousuf/GhostTool/releases"><img src="https://img.shields.io/github/downloads/0xAhmadYousuf/GhostTool/total?style=for-the-badge&color=00aa99" alt="Downloads"></a>
  <a href="https://github.com/0xAhmadYousuf/GhostTool/blob/main/LICENSE"><img src="https://img.shields.io/github/license/0xAhmadYousuf/GhostTool?style=for-the-badge&color=18f0d8" alt="License"></a>
</div>

<br>

GhostTool is a fast, standalone desktop application that packs **23+ essential offline utilities** into one clean, distraction-free window. No internet required, no tracking, and no complex installations—just pure utility that runs securely strictly on your machine.

Whether you need to instantly compare text, check your computer's health, securely encrypt a password, or focus using a built-in Pomodoro timer—GhostTool has it natively built-in for you.

---

### <img src="assets/download.svg" width="35" style="vertical-align: middle;"> Get GhostTool (For Everyday Users)

You **do not** need to be a programmer to use GhostTool. It comes as a simple, ready-to-use application.

1. **[Download the Latest Release (v0.0.1-beta)](https://github.com/0xAhmadYousuf/GhostTool/releases/tag/v0.0.1-beta)**
2. Choose your operating system and download its specific file:
   <br><br>
   &nbsp;&nbsp;&nbsp;&nbsp; <img src="assets/os_win.svg" height="40" style="vertical-align: middle;"> **Windows:** Download the `.exe` file.<br><br>
   &nbsp;&nbsp;&nbsp;&nbsp; <img src="assets/os_mac.svg" height="45" style="vertical-align: middle;"> **Mac:** Download the `.app.tar.gz` file.<br><br>
   &nbsp;&nbsp;&nbsp;&nbsp; <img src="assets/os_lin.png" height="45" style="vertical-align: middle;"> **Linux:** Download the `.bin` file.<br><br>
3. Double-click the downloaded file to open GhostTool. That's it! No installation wizards or setup required.

<br>

### <img src="assets/code.svg" width="35" style="vertical-align: middle;"> Build From Source (For Power Users)

If you prefer to audit the raw Python code or build the binary engine yourself from scratch:

**Prerequisites:** Python 3.10+ and Git

```bash
# 1. Clone the repository
git clone https://github.com/0xAhmadYousuf/GhostTool.git
cd GhostTool

# 2. Install required dependencies
pip install -r requirements.txt

# 3. Run the app natively
python main.py

# 4. Optional: Compile a portable executable using Nuitka
python -m nuitka --assume-yes-for-downloads --standalone --onefile --include-data-dir=static=static --include-data-dir=templates=templates main.py
```

<br>

---

### <img src="assets/star.svg" width="35" style="vertical-align: middle;"> Support The Project
If you find GhostTool helpful, please consider leaving a **Star** on this repository! It helps the project grow and greatly motivates further development and support.

### <img src="assets/handshake.svg" width="35" style="vertical-align: middle;"> Contributing & Security

Because this project aims to remain extremely lightweight and humble, we try to avoid bloated documentation. Instead, please refer to the following guidelines if you wish to help or report an issue:

- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Guidelines on how to submit pull requests and add new tool plugins.
- **[SECURITY.md](SECURITY.md)**: Information about supported versions and how to report vulnerabilities securely.

<br>

<div align="center">
  <i>Designed and Built by <a href="https://github.com/0xAhmadYousuf">0xAhmadYousuf</a></i>
</div>
