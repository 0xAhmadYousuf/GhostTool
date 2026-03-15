# Security Policy

GhostTool is intended to be a humble, lightweight utility that runs exclusively locally without cloud hooks or external dependencies.

## Supported Versions

Because GhostTool is so small and meant to execute as a totally self-contained standalone binary:
**All versions are entirely independent.** 

We do not backport security patches to older releases. If a vulnerability or bug is discovered, it will be patched immediately in the `main` branch, and a new standalone executable will be generated natively.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

We highly recommend throwing away older standalone binaries and always downloading the latest artifact from the [Releases](https://github.com/0xAhmadYousuf/GhostTool/releases) tab.

## Reporting a Vulnerability

Since this application is intentionally small, local, and lacks external tracking, severe cross-site or remote-execution vulnerabilities are unlikely by design, unless a fundamental dependency (like PyWebView or Flask) is compromised.

If you discover a security issue:
1. Please do not open a public issue.
2. Email or privately contact the repository owner (0xAhmadYousuf) first.
3. We will verify the patch, update the `requirements.txt` if it's a downstream dependency, and re-trigger the Nuitka compilation pipelines to securely distribute a new binary version.
