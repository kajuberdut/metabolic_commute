# 🚀 App Minification Progress

This document tracks the file size improvements as optimization techniques are applied to the application.

## 📊 Comparison Table

| Milestone | Transferred Size | Resources Size | Savings (Transferred) | % Reduced |
| :--- | :--- | :--- | :--- | :--- |
| **Initial Build** | 119 KB | 130 KB | - | - |
| **Bun Minification** | 110 KB | 120 KB | **9 KB** | **7%** |

---

## 📝 Optimization Log

### 1. Initial Build
- **State**: Standard build with no minification, source maps included, and default bundling settings.
- **Goal**: Establish a baseline for performance metrics.

### 2. Bun Minification
- **Method**: Implemented custom `build.ts` script within a multi-stage Docker build.
- **Changes**: 
    - Bundled and minified JS/CSS using Bun native builder.
    - Minified HTML via regex (removing comments, reducing whitespace).
- **Result**: Successfully reduced the payload by 9 KB / 7%.

---

## 🛠 Next Steps & Ideas
- [ ] **font baking**: Using Goole webfonts helper to embed fonts in the app.
- [ ] **Gzip / Brotli Compression**: Check if the server is serving files with modern compression.
