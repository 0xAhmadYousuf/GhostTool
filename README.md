<div align="center">
  <img src="assets/logo.svg" width="300" height="300" alt="GhostTool Logo">
  <h1>GhostTool</h1>
  <p><i>A humble, lightweight utility hub for developers and power users.</i></p>

  <!-- Badges -->
  <a href="https://github.com/0xAhmadYousuf/GhostTool/releases"><img src="https://img.shields.io/github/v/release/0xAhmadYousuf/GhostTool?style=flat-square&color=ff7722" alt="Release"></a>
  <a href="https://github.com/0xAhmadYousuf/GhostTool/blob/main/LICENSE"><img src="https://img.shields.io/github/license/0xAhmadYousuf/GhostTool?style=flat-square&color=00aa99" alt="License"></a>
  <a href="https://github.com/0xAhmadYousuf/GhostTool/actions"><img src="https://img.shields.io/github/actions/workflow/status/0xAhmadYousuf/GhostTool/release.yml?style=flat-square" alt="Build Status"></a>
</div>

---

GhostTool is a small, standalone desktop application consolidating 23+ essential offline utilities (JSON formatters, diff viewers, local world clocks, hardware telemetry, etc.) into a fast, single-page UI. Built entirely with Python, Flask, and PyWebView, it requires zero cloud dependencies and respects your privacy.

## ✨ Getting Started

You have two choices: download a ready-to-use standalone executable, or run and build it from the source code.

### Option 1: Download Standalone Executable (Recommended)
GhostTool compiles into a single, zero-dependency binary (Windows `.exe`, Linux `.bin`, macOS `.app`). 
Simply download the latest build for your operating system from the **[Releases](https://github.com/0xAhmadYousuf/GhostTool/releases)** page and double-click to run!

### Option 2: Run & Build From Source
If you prefer to audit the raw Python code or build the binary yourself:

**Prerequisites:**
- Python 3.10+
- Git

```bash
# 1. Clone the repository
git clone https://github.com/0xAhmadYousuf/GhostTool.git
cd GhostTool

# 2. Install required dependencies
pip install -r requirements.txt

# 3. Run the app natively
python main.py

# 4. (Optional) Compile your own portable executable using Nuitka
python -m nuitka --assume-yes-for-downloads --standalone --onefile --include-data-dir=static=static --include-data-dir=templates=templates main.py
```

## ⭐ Support
If you find GhostTool helpful, please consider leaving a **Star** on this repository! It helps the project grow and motivates further development.

## 🤝 Contributing & Security

Because this project aims to remain extremely lightweight and humble, we try to avoid bloated documentation. Instead, please refer to the following guidelines if you wish to help or report an issue:

- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Guidelines on how to submit pull requests and add new tools.
- **[SECURITY.md](SECURITY.md)**: Information about supported versions and how to report vulnerabilities securely.

---
<div align="center">
  <i>Created by <a href="https://github.com/0xAhmadYousuf">0xAhmadYousuf</a></i>
</div>
