# Security Policy

## Supported Versions

The following versions of PixelForge are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

We strongly recommend always using the latest release to benefit from the most recent security patches and improvements.

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue to report a security vulnerability.**

If you discover a potential security issue in PixelForge, we ask that you responsibly disclose it by contacting us directly via email:

**📧 [info@spmanchester.com](mailto:info@spmanchester.com)**

Please include the following in your report:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact or attack scenario
- Any suggested mitigations (optional)

Your report will be handled confidentially by the SPManchester Private Limited team.

---

## Response Timeline

We take all security reports seriously and are committed to addressing them promptly:

| Milestone                              | Target Timeframe         |
| -------------------------------------- | ------------------------ |
| Acknowledgement of report              | Within **48 hours**      |
| Initial assessment & severity triage   | Within **5 business days** |
| Patch / fix for **critical** issues    | Within **14 days**       |
| Patch / fix for **moderate/low** issues | Within **30 days**       |
| Public disclosure (coordinated)        | After patch is released  |

We will keep you informed throughout the process and coordinate any public disclosure with you.

---

## Scope

### In Scope

The following are considered valid security vulnerabilities for PixelForge:

- **Cross-Site Scripting (XSS)** — particularly any input or output handling within `app.js`, including canvas rendering logic, file name handling, or any user-supplied data that could execute arbitrary scripts.
- **Sensitive Data Exposure** — any unintended leakage of user data (e.g., image content, file metadata, local storage values) to third parties or the console.
- **Malicious File Processing** — crafted image/WebP files that cause unintended code execution or memory corruption in the browser context.
- **Unsafe Object URLs / Blob Handling** — improper revocation or exposure of object URLs that could be exploited.
- **Content Security Policy Bypasses** — anything that circumvents intended browser security policies enforced by the application.

### Out of Scope

The following are **not** considered in-scope vulnerabilities:

- Bugs or security issues in the user's browser, browser extensions, or plugins.
- Vulnerabilities in the user's operating system or local environment.
- Issues that require physical access to the user's device.
- Denial-of-service caused by processing extremely large files (this is a known browser limitation, not an application flaw).
- Security issues in third-party libraries that have already been publicly disclosed and are pending an upstream fix.

---

## Attack Surface

PixelForge is a **fully client-side application** with no backend server, no database, and no network communication. All image processing occurs entirely within the user's browser using the HTML5 Canvas API and native browser APIs.

This architecture significantly limits the attack surface:

- There is **no server** to compromise.
- There are **no user accounts or stored credentials**.
- There is **no data transmitted** to any remote server.
- There is **no persistent storage** beyond what the user explicitly downloads.

Security concerns are therefore scoped to the browser execution environment and local file handling only.

---

## Credits

We believe in and appreciate responsible disclosure. Researchers who report valid, in-scope security vulnerabilities in good faith will be:

- **Acknowledged by name** (or handle, if preferred) in the release notes of the patched version.
- Kept informed throughout the remediation process.

We are grateful to the security research community for helping keep PixelForge and its users safe.

---

*This Security Policy is maintained by **SPManchester Private Limited**. Last reviewed: November 2026.*
