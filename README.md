# CampusMate — Student Productivity Dashboard

CampusMate is a responsive student dashboard built with **HTML, CSS and vanilla JavaScript**. It helps students organize tasks, save quick notes and run Pomodoro-style focus sessions.

## Features

- Dashboard with task statistics and daily completion progress
- Add, complete, search, filter and delete tasks
- Task categories, priorities and due dates
- Quick notes with create and delete actions
- Focus timer with 25-minute focus, 5-minute short break and 15-minute long break
- Saves tasks, notes and focus minutes in browser `localStorage`
- Responsive layout for desktop, tablet and mobile
- No frameworks or backend required

## Project structure

```text
campusmate/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a browser.
3. Start adding tasks and notes.

You can also use the VS Code **Live Server** extension.

## Deploy with GitHub Pages

1. Create a public GitHub repository named `campusmate`.
2. Upload the four project files to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site.

## Tech stack

- HTML5
- CSS3 (Grid, Flexbox, responsive media queries)
- Vanilla JavaScript (DOM, events, timers, localStorage)

## Note

Data is stored in the current browser using `localStorage`. It does not sync between different devices or browsers. This project is a front-end demo and does not use a server or user authentication.

---

Made with care by Dhanlal Yadav.
