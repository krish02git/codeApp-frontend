# codeApp Frontend

Welcome to the frontend of **codeApp**, a state-of-the-art competitive programming and code editor platform. Built with **React 19**, **Vite**, **Redux Toolkit**, and **Tailwind CSS v4**, the application delivers a premium, responsive user experience similar to LeetCode.
---

## 📸 Screenshots

Here is a preview of the **codeApp** user interface:

| ![Homepage](photos/Screenshot%202026-06-20%20164514.png) | ![Login Page](photos/Screenshot%202026-06-20%20164538.png) |

| ![Signup Page](photos/Screenshot%202026-06-20%20164604.png) | ![Admin Panel](photos/Screenshot%202026-06-20%20164623.png) |

| ![Coding Workspace & AI Chat](photos/Screenshot%202026-06-20%20164700.png) |

---

## 🚀 Features

- **Interactive Coding Workspace**: A tabbed layout on the problem page featuring:
  - **Description**: Detailed description, tags, examples, and metadata.
  - **Solution / Monaco Code Editor**: Powered by `@monaco-editor/react` with full syntax highlighting, bracket matching, language selection, and theme synchronization.
  - **Submissions**: History of run and evaluation results, indicating execution time (runtime) and status.
  - **Socratic AI Chat**: An AI chat sidebar helping users solve compiler errors or algorithm queries step-by-step.
- **Problem Dashboard**: Search, filter, and view problem lists featuring status trackers (solved vs. unsolved) and difficulty levels.
- **Admin Dashboard**: Full CRUD interface for administrators to create, update, and delete coding problems, manage visible/hidden test cases, and template codes.
- **Responsive Premium Theme**: Built-in support for theme toggle utilizing Tailwind CSS v4 and DaisyUI v5 styling.
- **Secure Authentication Forms**: Robust form validations built on `react-hook-form` and `zod` schemas.

---

## 🛠️ Tech Stack & Key Libraries

- **Build Tool**: Vite
- **UI Framework**: React 19
- **State Management**: Redux Toolkit & React-Redux
- **Styling**: Tailwind CSS v4 & DaisyUI v5
- **Code Editor Component**: Monaco Editor React (`@monaco-editor/react`)
- **Forms & Validation**: React Hook Form, `@hookform/resolvers`, and Zod
- **HTTP Client**: Axios

---

## 📂 Directory Structure

```
frontend/
├── src/
│   ├── assets/           # Static asset assets (logos, images, etc.)
│   ├── components/       # Global/Reusable UI elements (e.g., ThemeToggle)
│   ├── pages/            # Core views:
│   │   ├── Homepage.jsx  # Main list of programming problems
│   │   ├── Login.jsx     # User login screen
│   │   ├── Signup.jsx    # User registration screen
│   │   ├── AdminPage.jsx # Admin panel for problem creators
│   │   ├── ProblemPage.jsx # Multi-panel problem-solving workspace
│   │   └── component/    # Page-specific components (Chat, Description, Editorial, Solution, Submission)
│   ├── stores/           # Redux Store config
│   ├── theme/            # Theme setups and styling helpers
│   ├── utils/            # Helper modules
│   ├── App.css           # Global application styles
│   ├── index.css         # Main stylesheet with Tailwind directives
│   ├── App.jsx           # Main router and shell layout
│   └── main.jsx          # Entry point
├── package.json          # Dependency mappings
└── vite.config.js        # Vite configurations
```

---

## 💻 Pages Breakdown

### 1. Main Dashboard (`src/pages/Homepage.jsx`)
Lists all available algorithmic problems. Users can filter list items by tags, search by keywords, and select problems based on difficulty (`Easy`, `Medium`, `Hard`).

### 2. Workspace View (`src/pages/ProblemPage.jsx`)
Divided into panels for distraction-free coding:
- **Left Panel**: Tabbed options to read the problem statement, view the editorial instructions, or view submission history.
- **Right Panel**: A Monaco-based code editor to write solutions. Users can run code against visible test cases or submit code for final test-case verification.
- **Sidebar Chat**: Connects to the backend Socratic AI mentor for hints and debugging help.

### 3. Admin Control Panel (`src/pages/AdminPage.jsx`)
Admins can easily define new challenges, specify start code templates (Python, C++, JS, Java, Rust, Go), configure test cases (both input/output validation targets and visible explanations), and tag problems.

---

## ⚡ Setup & Development

### Prerequisite: Node.js (version 18+ recommended)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   The site will load locally (usually at [http://localhost:5173](http://localhost:5173)).

3. **Build Production Assets**:
   ```bash
   npm run build
   ```
