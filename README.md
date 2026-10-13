# AI Invoice Extractor - Frontend Web Application

A modern, responsive, enterprise-grade web application built with **React 18**, **Vite**, **Tailwind CSS**, and **Lucide Icons** for extracting and visualizing structured invoice and GST compliance data.

---

## Key Features

- **Document Dropzone**:
  - Full-bleed native touch & drag-and-drop file upload zone.
  - Supports single and multi-page **PDF**, **JPG**, **JPEG**, **PNG**, and **WebP** files (up to 10 MB).
- **Fully Responsive Architecture (Mobile, Tablet, Desktop)**:
  - **Mobile Card View**: On screens < 640px, invoice line items render as native touch cards with item numbers, HSN/SAC badges, unit price, quantity, taxable subtotal, GST split, and item total.
  - **Desktop / Spreadsheet Table View**: Full 8-column itemized table with horizontal scrolling indicator.
  - **Instant View Toggle**: Switch between **Cards View** and **Table View** with one click on mobile.
- **Enterprise Financial & GST Breakdown**:
  - Structured overview: Invoice #, PO/Order #, Issue Date, Due Date, Payment Method.
  - Vendor and Customer legal details and addresses.
  - Indian GST Compliance: Vendor GSTIN, Customer GSTIN, PAN, Reverse Charge (RCM), and Place of Supply.
  - Tax split cards: Central GST (CGST), State GST (SGST), and Integrated GST (IGST).
- **Developer & Export Utilities**:
  - **1-Click Copy**: Fast clipboard copy with feedback toast for any field or full JSON.
  - **JSON Export & Download**: Download verified structured JSON output.
  - **CSV Export**: Export itemized line items to CSV format for Excel/accounting software.
  - **Interactive Schema Modal**: Live inspection of the JSON Schema (Draft 2020-12) specification.
- **Resilience & Zero Crashes**:
  - Integrated React `ErrorBoundary` with instant recovery.
  - Defensive type parsing and formatting for numbers, dates, and amounts.

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | Component-based UI with hooks |
| **Vite** | Blazing-fast build tool and dev server |
| **Tailwind CSS** | Custom design system, dark mode, responsive layouts |
| **Lucide React** | Sleek, modern icons |

---

## Project Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Navigation and backend health indicator
│   │   ├── UploadZone.jsx          # Native touch-friendly dropzone
│   │   ├── ExtractionProgress.jsx  # Multi-step progress animation
│   │   ├── InvoiceResult.jsx       # Structured view, GST cards, mobile line cards & table
│   │   ├── JsonModal.jsx           # Raw JSON inspector & download modal
│   │   ├── SchemaModal.jsx         # 27-field JSON Schema Draft 2020-12 reference
│   │   ├── ErrorAlert.jsx          # User-friendly backend error alerts
│   │   ├── ErrorBoundary.jsx       # React ErrorBoundary for crash prevention
│   │   └── Toast.jsx               # Floating toast notifications
│   ├── App.jsx                     # Application root state & workflow coordinator
│   ├── main.jsx                    # React DOM entry point
│   └── index.css                   # Global styles & ambient gradient glow
├── index.html                      # HTML5 template
├── vite.config.js                  # Vite configuration & dev proxy
└── package.json                    # Dependencies & scripts
```

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js 18+ and npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file:
```ini
VITE_API_BASE_URL=http://localhost:8000
```
*(Leave empty or set to `http://localhost:8000` to proxy API requests to FastAPI).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.
