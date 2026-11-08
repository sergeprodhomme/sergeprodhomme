# CraftOps Mini Webapp

A lightweight project-planning and validation workspace for:
- User story design
- Behavior-driven development (BDD)
- Test-driven development (TDD)
- Docker / DevOps container management
- Cybersecurity testing workflow

## Features

- Dashboard overview for project health, stories, test status, and security posture
- Story management with backlog and status
- BDD scenario capture with Given / When / Then steps
- TDD checklist and validation tracking
- Docker container status panel
- Security testing queue and remediation tracker

## Run locally

```bash
npm install
npm start
```

Then open: http://localhost:3000

## Docker

```bash
docker compose up --build
```

## Project structure

```text
craftops/
├── .gitignore
├── README.md
├── docker-compose.yml
├── package.json
├── server.js
├── data/
│   └── store.json
├── public/
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── .env.example
```
