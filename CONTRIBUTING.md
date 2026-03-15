# Contributing to GhostTool

First of all, thank you for taking the time to contribute! GhostTool is designed to be a tiny, standalone, and extremely humble application. We prefer to keep the toolset and codebase extremely focused to prevent bloat.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please check the existing issues to ensure it hasn't already been reported. When filing a bug, please include:
- A clear description of the problem.
- Steps to reproduce the issue.
- Details about your environment (OS, Python Version, etc.).

### Suggesting Enhancements & New Tools
Since this project deliberately avoids robust documentation and prefers a minimal footprint:
- Propose new tools by opening an Issue first. 
- Ensure that the suggested feature does not introduce heavy backend dependencies unless absolutely structurally necessary. We aim for zero-dependency standalone bundling via `Nuitka`.
- UI/UX changes should stick with the established dark CRT aesthetic.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. Make your modifications (keep commits atomic and messages clear).
3. If you add a new tool or make substantial changes, ensure it passes the local GitHub Actions build natively (`pytest` or executing `python main.py` flawlessly).
4. Do not include heavy documentation updates, as this tool is meant to be intuitive and lightweight.
5. Create a PR detailing precisely why the change is beneficial.

Thank you for your help!
