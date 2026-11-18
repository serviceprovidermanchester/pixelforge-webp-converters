# Contributing to PixelForge

Thank you for your interest in contributing to **PixelForge**! We at **SPManchester Private Limited** warmly welcome contributions from the community. Whether you're fixing a bug, suggesting a new feature, improving documentation, or helping with code quality — every contribution matters and is deeply appreciated.

Please take a moment to read through these guidelines before getting started. Following them helps us maintain a high-quality, collaborative project for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Contact](#contact)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By contributing, you agree to abide by its terms. We are committed to providing a welcoming and respectful environment for all contributors, regardless of background or experience level.

Please report any unacceptable behaviour to [info@spmanchester.com](mailto:info@spmanchester.com).

---

## Reporting Bugs

Found a bug? We'd love to know about it so we can fix it!

**Before submitting a bug report:**
- Search the [existing issues](https://github.com/SPManchester/webp/issues) to make sure the bug hasn't already been reported.
- Make sure you're using the latest version of PixelForge.

**To report a bug:**
1. Open a new [GitHub Issue](https://github.com/SPManchester/webp/issues/new).
2. Use a clear, descriptive title (e.g., `Bug: Image conversion fails for files over 10MB`).
3. Include the following in your report:
   - A concise description of the problem.
   - Steps to reproduce the behaviour.
   - Expected vs. actual behaviour.
   - Screenshots or screen recordings if applicable.
   - Browser name and version, and operating system.

The more detail you provide, the faster we can diagnose and resolve the issue.

---

## Suggesting Features

We're always open to ideas that make PixelForge better!

**Before submitting a feature request:**
- Check the [existing issues](https://github.com/SPManchester/webp/issues) to see if a similar request has already been made.

**To suggest a feature:**
1. Open a new [GitHub Issue](https://github.com/SPManchester/webp/issues/new).
2. Use the prefix `Feature Request:` in your title (e.g., `Feature Request: Batch image conversion support`).
3. Describe the feature clearly:
   - What problem does it solve?
   - How should it work from the user's perspective?
   - Any examples or references that might help illustrate the idea.

We review all feature requests and will respond as promptly as possible. Not every request can be implemented, but all feedback is genuinely valued.

---

## Development Setup

PixelForge is a zero-dependency, browser-based tool — no build step required. Getting up and running is straightforward:

1. **Fork the repository**

   Click the **Fork** button at the top-right of the [PixelForge repository](https://github.com/SPManchester/webp) to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/<your-username>/webp.git
   cd webp
   ```

3. **Open in your browser**

   Simply open `index.html` in any modern web browser:

   ```bash
   # On Windows
   start index.html

   # On macOS
   open index.html

   # On Linux
   xdg-open index.html
   ```

   That's it — no npm install, no build tools, no configuration required.

4. **Create a branch for your work**

   ```bash
   git checkout -b feat/your-feature-name
   ```

5. **Make your changes**, then commit and push (see conventions below).

---

## Commit Message Conventions

We follow a structured commit message format to keep the project history clean and easy to navigate. Please use the following prefixes:

| Prefix       | Use for                                                     |
|--------------|-------------------------------------------------------------|
| `feat:`      | A new feature or enhancement                                |
| `fix:`       | A bug fix                                                   |
| `docs:`      | Documentation changes only                                  |
| `style:`     | Formatting, whitespace, or cosmetic changes (no logic change) |
| `refactor:`  | Code restructuring with no behaviour change                 |
| `chore:`     | Maintenance tasks (e.g., updating comments, file renames)   |

**Examples:**

```
feat: add drag-and-drop image upload support
fix: resolve off-by-one error in quality slider
docs: update README with browser compatibility table
style: normalise indentation across main.js
refactor: extract image rendering logic into helper function
chore: rename assets folder to resources
```

Keep commit messages concise and written in the **imperative mood** (e.g., "add support" not "added support").

---

## Pull Request Process

We follow a standard fork-and-branch workflow. Here's how to submit your contribution:

1. **Fork & clone** the repository (see [Development Setup](#development-setup) above).
2. **Create a dedicated branch** for your change — never work directly on `main`:
   ```bash
   git checkout -b fix/descriptive-branch-name
   ```
3. **Make your changes**, following the [Coding Standards](#coding-standards) below.
4. **Commit your changes** using the [commit conventions](#commit-message-conventions) above.
5. **Push your branch** to your fork:
   ```bash
   git push origin fix/descriptive-branch-name
   ```
6. **Open a Pull Request** against the `main` branch of the upstream PixelForge repository.
   - Provide a clear title and description of what your PR does and why.
   - Reference any related issues using `Closes #<issue-number>` if applicable.
   - Include before/after screenshots for visual changes.

7. **Review process** — A maintainer from **SPManchester Private Limited** will review your PR. Please be responsive to feedback; we aim to review all PRs in a timely manner. You may be asked to make revisions before your PR is merged.

8. Once approved, your PR will be merged by a maintainer. 🎉

> **Note:** By submitting a Pull Request, you confirm that your contribution is your own work and that you agree to license it under the same licence as this project.

---

## Coding Standards

PixelForge is built with **vanilla JavaScript, HTML, and CSS** — and we intend to keep it that way. Please follow these guidelines when writing or modifying code:

- **No external libraries or frameworks.** We maintain a strict **zero-dependency policy**. Do not introduce npm packages, CDN-linked scripts, or any third-party dependencies.
- **Vanilla JS only.** Use plain ES6+ JavaScript. Avoid jQuery, Lodash, or any other utility libraries.
- **Readable code over clever code.** Prioritise clarity. Add comments where the intent of the code is not immediately obvious.
- **Consistent formatting.** Match the existing indentation and style of the file you're editing (2-space indentation for JS/HTML/CSS).
- **Keep it lean.** Avoid adding unnecessary abstraction. PixelForge values simplicity and performance.
- **Test in multiple browsers.** Verify your changes work correctly in at least two modern browsers (e.g., Chrome and Firefox) before submitting.

---

## Contact

Have a question that isn't covered here? Feel free to reach out to the team at **SPManchester Private Limited**:

📧 **[info@spmanchester.com](mailto:info@spmanchester.com)**

We're happy to help and look forward to collaborating with you!

---

*Made with ❤️ by SPManchester Private Limited.*
