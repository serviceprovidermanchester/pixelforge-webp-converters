# PixelForge — Architecture Overview

> **Company:** SPManchester Private Limited  
> **Project:** PixelForge — Client-Side Image Conversion Tool  
> **Document Version:** 1.0

---

## Overview

PixelForge is a **purely static, client-side** web application. There is no server, no backend, no database, and no network calls during operation. Every image conversion happens entirely within the user's browser using standard Web APIs. The application can be served from any static file host — or even opened directly from the local filesystem as a plain HTML file.

This architecture has several deliberate benefits:

- **Privacy by design** — uploaded images never leave the user's device.
- **Zero infrastructure cost** — no servers to provision, patch, or scale.
- **Offline capable** — once the page is loaded, an internet connection is not required.
- **Instant deployment** — any static hosting provider (GitHub Pages, Netlify, Vercel, Cloudflare Pages) works out of the box.

---

## Processing Pipeline

The following flowchart illustrates the complete data flow from the moment a user selects a file to the moment the converted file is downloaded.

```mermaid
flowchart TD
    A([User]) -->|Selects or drops image| B[Browser]
    B --> C{File Input\ndrag/drop or click}
    C -->|File object| D[FileReader API\nreadAsDataURL / readAsArrayBuffer]
    D -->|data URL / ArrayBuffer| E[HTMLCanvasElement\ncreateElement canvas]
    E --> F[Canvas 2D Context\nctx.drawImage]
    F -->|Pixel data rendered| G{Output Format?}
    G -->|PNG| H["toBlob('image/png')"]
    G -->|JPG| I["toBlob('image/jpeg', quality)"]
    G -->|BMP| J[Manual BMP\nHeader Construction\nUint8Array]
    G -->|ICO| K[Multi-resolution\nICO Header\n+ PNG frames]
    G -->|PDF| L[Manual PDF\nStructure Writer]
    G -->|SVG| M[SVG Wrapper\n+ Embedded base64]
    G -->|BASE64| N["canvas.toDataURL()\nas plain text"]
    H & I & J & K & L & M & N --> O[Output File\nBlob / Data URL]
    O --> P[FileSaver / Anchor\nDownload trigger]
    P -->([Downloaded File\non User's Device])
```

---

## Key Components

### `index.html` — UI Shell

The root HTML document provides the full structural skeleton of the application.

| Responsibility | Detail |
|---|---|
| File input element | Accepts image files via `<input type="file">` and drag-and-drop events |
| Format selector | `<select>` dropdown or radio buttons for the target format |
| Quality slider | Range input for JPEG quality (0–100) |
| Preview area | `<img>` or `<canvas>` element for live preview |
| Download trigger | Anchor element (`<a download>`) or button wired to FileSaver |
| Script/style links | References `style.css` and `app.js` — no bundler or build step required |

### `style.css` — Design System

The stylesheet implements the visual language of PixelForge without any CSS framework dependency.

| Responsibility | Detail |
|---|---|
| Layout | CSS Grid / Flexbox responsive layout |
| Theming | CSS custom properties (`--color-primary`, `--radius`, etc.) for easy re-branding |
| Drag-and-drop states | `:hover` and `.drag-over` class-based visual feedback |
| Responsive breakpoints | Mobile-first media queries; usable on tablets and phones |

### `app.js` — Conversion Engine

The core of PixelForge. Handles all file I/O, image decoding, canvas rendering, and format-specific encoding.

| Responsibility | Detail |
|---|---|
| File ingestion | `FileReader.readAsDataURL()` → `new Image()` → `ctx.drawImage()` |
| Canvas sizing | Canvas is sized to match source image natural dimensions |
| Format dispatch | Switch/map on the selected target format, calls the appropriate encoder |
| Blob URL lifecycle | `URL.createObjectURL()` → trigger download → `URL.revokeObjectURL()` |
| Error handling | Try/catch around canvas operations; user-facing error messages |

---

## Format Conversion Details

### PNG — `toBlob('image/png')`

```
canvas.toBlob(callback, 'image/png')
```

Lossless encoding handled entirely by the browser's native PNG encoder. Alpha channel is preserved. No quality parameter applies.

---

### JPEG — `toBlob('image/jpeg', quality)`

```
canvas.toBlob(callback, 'image/jpeg', qualityValue)  // qualityValue: 0.0–1.0
```

The quality slider maps `0–100` → `0.0–1.0`. Note: JPEG does not support transparency; the canvas background is composited to white before encoding to avoid black fill artefacts.

---

### BMP — Manual Header Construction

The browser has no native BMP encoder, so PixelForge writes the header manually using a `Uint8Array`:

1. Read raw RGBA pixel data via `ctx.getImageData()`.
2. Convert RGBA → BGRA (BMP byte order).
3. Write a 54-byte BITMAPFILEHEADER + BITMAPINFOHEADER.
4. Append pixel rows bottom-up (BMP row order).
5. Wrap the buffer as a `Blob` with MIME type `image/bmp`.

---

### ICO — Multi-Resolution ICO Header

An ICO file is a container for one or more PNG or BMP frames:

1. Render the source image at multiple resolutions (e.g. 16×16, 32×32, 48×48, 256×256) by redrawing on resized canvases.
2. Encode each frame as a PNG blob (`toBlob('image/png')`).
3. Construct the ICO directory header (6-byte global header + 16-byte entry per frame).
4. Concatenate header + all frame data into a single `ArrayBuffer`.
5. Output as `Blob` with MIME type `image/x-icon`.

---

### PDF — Manual PDF Structure

PixelForge writes a minimal valid PDF without any third-party library:

1. Encode the canvas image as a JPEG data URL.
2. Strip the `data:image/jpeg;base64,` prefix to get raw base64.
3. Write the PDF object stream by hand:
   - `%PDF-1.4` header
   - Image XObject with `/DCTDecode` filter (JPEG)
   - Page object referencing the image at full page size
   - Cross-reference table and `%%EOF` trailer
4. Output as `Blob` with MIME type `application/pdf`.

---

### SVG — SVG Wrapper with Embedded Base64

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="W" height="H">
  <image href="data:image/png;base64,..." width="W" height="H"/>
</svg>
```

The canvas is serialised to a PNG data URL (`canvas.toDataURL('image/png')`), then embedded as the `href` of an SVG `<image>` element. The result is a valid, self-contained SVG file. This is a rasterised SVG, not a vector trace.

---

### BASE64 — Plain Text Data URL

```
canvas.toDataURL('image/png')
```

The full data URL string (including the `data:image/png;base64,` prefix) is written to a `.txt` file. This is useful for embedding images directly in CSS, HTML attributes, or JSON payloads.

---

## Security Model

PixelForge is designed with a strong security posture:

| Property | Implementation |
|---|---|
| **Zero network calls** | No `fetch`, `XMLHttpRequest`, WebSocket, or external resource loads at runtime. All assets (HTML, CSS, JS) are loaded once at page load. |
| **Blob URL cleanup** | Every `URL.createObjectURL()` call is paired with `URL.revokeObjectURL()` immediately after the download is triggered, preventing memory leaks and unintended persistence. |
| **No localStorage / sessionStorage** | User images and conversion results are never persisted to any browser storage. |
| **No cookies** | The application sets no cookies and reads none. |
| **No third-party scripts** | No analytics, CDN-hosted frameworks, or tracking pixels. |
| **CSP-compatible** | A strict `Content-Security-Policy` header can be applied by the host without breaking functionality. |
| **Same-origin canvas** | All canvas operations are on locally-sourced data; no cross-origin image tainting issues. |

---

## Performance Notes

### Current Approach — Synchronous Canvas

All conversion work currently runs on the **main browser thread** in a synchronous (blocking) manner:

- For typical web images (< 20 MP), processing completes in under 500 ms on modern hardware.
- The UI may show a brief "processing" state; a spinner or progress indicator is recommended for large files.
- Very large images (> 50 MP) may cause a momentary UI freeze on lower-end devices.

### Future Consideration — Web Workers

To eliminate main-thread blocking entirely, the conversion engine (`app.js`) can be migrated to a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API):

```
Main Thread                     Worker Thread
─────────────────               ──────────────────────────
FileReader (UI thread) ──────▶  postMessage({ imageData, format, quality })
                                   ↓
                                Canvas (OffscreenCanvas API)
                                   ↓
                         ◀────  postMessage({ blob })
Anchor download trigger
```

> [!NOTE]
> `OffscreenCanvas` is required for canvas operations inside a Worker. It is supported in all modern browsers (Chrome 69+, Firefox 105+, Safari 16.4+). A feature-detect fallback to the current main-thread approach is recommended for maximum compatibility.

---

## Directory Structure

```
webp/
├── index.html          # UI shell — entry point
├── style.css           # Design system
├── app.js              # Conversion engine
├── docs/
│   ├── ARCHITECTURE.md # This document
│   └── DEPLOYMENT.md   # Hosting and deployment guide
└── README.md           # Project overview
```

---

*PixelForge is a product of **SPManchester Private Limited**. All rights reserved.*
