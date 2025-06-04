---
trigger: always_on
---

# DealSensei – Frontend Design Specification

## Overview

This document defines the UI/UX design tokens, visual language, patterns, and key frontend setup guidelines for the _DealSensei_ CRM platform. It is intended to serve as a canonical reference for AI agents and developers involved in design generation, component styling, and layout consistency.

---

## 1. Branding & Theme

**Name**: DealSensei  
**Design Inspiration**: [n8n.io](https://n8n.io)  
**Dark Mode**: ✅ Enabled  
**Forms**: Labels + Help Text

---

## 2. CSS Theme Tokens

### ✅ Light Theme

```css
:root {
  --background: hsl(35, 25%, 97%);
  --foreground: hsl(25, 30%, 18%);
  --card: hsl(35, 25%, 97%);
  --card-foreground: hsl(25, 30%, 18%);
  --popover: hsl(35, 25%, 97%);
  --popover-foreground: hsl(25, 30%, 18%);
  --primary: hsl(25, 85%, 55%);
  --primary-foreground: hsl(35, 25%, 97%);
  --secondary: hsl(30, 20%, 94%);
  --secondary-foreground: hsl(25, 30%, 22%);
  --muted: hsl(30, 20%, 94%);
  --muted-foreground: hsl(25, 15%, 50%);
  --accent: hsl(15, 80%, 60%);
  --accent-foreground: hsl(35, 25%, 97%);
  --destructive: hsl(358, 75%, 60%);
  --destructive-foreground: hsl(35, 25%, 97%);
  --border: hsl(30, 15%, 90%);
  --input: hsl(30, 15%, 90%);
  --ring: hsl(25, 85%, 55%);
  --radius: 0.5rem;
}
```

### 🌒 Dark Theme

```css
.dark {
  --background: hsl(20, 15%, 12%);
  --foreground: hsl(30, 15%, 92%);
  --card: hsl(20, 15%, 12%);
  --card-foreground: hsl(30, 15%, 92%);
  --popover: hsl(20, 15%, 12%);
  --popover-foreground: hsl(30, 15%, 92%);
  --primary: hsl(25, 90%, 55%);
  --primary-foreground: hsl(20, 15%, 12%);
  --secondary: hsl(20, 15%, 18%);
  --secondary-foreground: hsl(30, 15%, 92%);
  --muted: hsl(20, 15%, 18%);
  --muted-foreground: hsl(30, 15%, 70%);
  --accent: hsl(15, 85%, 50%);
  --accent-foreground: hsl(30, 15%, 92%);
  --destructive: hsl(358, 65%, 50%);
  --destructive-foreground: hsl(30, 15%, 92%);
  --border: hsl(20, 15%, 20%);
  --input: hsl(20, 15%, 20%);
  --ring: hsl(25, 90%, 55%);
  --radius: 0.5rem;
}
```

---

## 3. Fonts

- **Primary Font**: [Inter](https://fonts.google.com/specimen/Inter)
- **Fallbacks**: `system-ui, sans-serif`
- **Apply via**: Google Fonts import or Tailwind config

---

## 4. Color Strategy

Colors are managed via CSS variables and bound into Tailwind using `hsl(var(--token) / <alpha-value>)`. Tokens include:

- `--background`, `--foreground`
- `--primary`, `--accent`, `--muted`
- `--border`, `--input`, `--ring`, etc.

---

## 5. Spacing

Uses Tailwind’s default 4pt spacing system:

| Class  | Pixels |
| ------ | ------ |
| `p-1`  | 4px    |
| `p-2`  | 8px    |
| `p-3`  | 12px   |
| …      | …      |
| `p-10` | 40px   |

---

## 6. UI Patterns

- **Layout**: Sidebar + Top bar layout (like n8n.io)
- **Forms**: Label above, help text below (e.g., `<label><input/><small></small></label>`)
- **Modals**: Use `@radix-ui/react-dialog`
- **Toasts**: Use `sonner`
- **Tables**: Implemented manually, not using `@tremor/react`

---

## 7. Icons

- **Icon Set**: [Lucide](https://lucide.dev)
- **Library**: `lucide-react` (already installed)
- **Usage**: `<UsersIcon size={18} className="text-muted-foreground" />`

---

## 8. References

| Tool                | Link                                     |
| ------------------- | ---------------------------------------- |
| Tailwind CSS        | https://tailwindcss.com/docs             |
| Radix UI            | https://www.radix-ui.com/docs/primitives |
| React Hook Form     | https://react-hook-form.com              |
| Redux Toolkit       | https://redux-toolkit.js.org             |
| Lucide Icons        | https://lucide.dev                       |
| Sonner              | https://sonner.emilkowal.dev             |
| Yup (Validation)    | https://github.com/jquense/yup           |
| Project Inspiration | https://n8n.io                           |

---

_End of document_
