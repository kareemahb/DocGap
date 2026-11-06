# DocGap

**Find the documentation that's costing your team the most time.**

DocGap is an operational knowledge health platform for support and IT teams. It connects recurring support issues to the documentation behind them, scores each document's "documentation debt," and shows whether a fix actually reduced tickets.

🔗 **Live demo:** _add link_
🎥 **Demo Day walkthrough:** _add link_

![DocGap screenshot]

---

## The Problem

Support teams lose hours answering the same questions because the docs behind them are outdated, missing details, or hard to follow. Knowledge bases grow without anyone tracking which pages are hurting the most, so fixes get prioritized by gut feeling instead of impact.

I spent years on the other side of this, filing bug reports and working support tickets. DocGap is the tool I wished I had.

## Features

- **Ticket-to-doc linking:** Connect recurring support issues to the knowledge base articles, SOPs, and runbooks they relate to.
- **Documentation Debt Score:** Each document gets a score based on:
  - Ticket volume
  - Time since the last review
  - Negative feedback
  - Missing information
  - Business impact
- **Prioritized fix list:** See the documents costing your team the most time, ranked so you know what to fix first.
- **Before-and-after impact tracking:** After a doc is updated, compare ticket activity before and after the change to confirm the fix worked.

## Tech Stack

| Layer      | Tools                                  |
| ---------- | -------------------------------------- |
| Frontend   | React, Tailwind CSS                    |
| Backend    | Node.js, Express.js (MVC architecture) |
| Database   | MongoDB                                |
| Deployment | Render (API)                           |

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- A MongoDB connection string (MongoDB Atlas or local)

### Installation

```bash
git clone https://github.com/kareemahb/DocGap.git
cd DocGap
```

Install dependencies for the server and client:

```bash
cd server && npm install
cd ../client && npm install
```

### Environment Variables

Create a `.env` file in the `server` folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### Run Locally

Start the API:

```bash
cd server
npm run dev
```

Start the React app in a second terminal:

```bash
cd client
npm run dev
```

## Project Structure

```
DocGap/
├── client/            # React + Tailwind frontend
│   └── src/
└── server/            # Express API
    ├── config/        # Database connection
    ├── controllers/   # Request handling logic
    ├── models/        # Mongoose schemas
    ├── routes/        # API routes
    └── server.js
```

## Roadmap

- [ ] AI agent that reviews high-debt docs, flags missing or outdated content, and drafts suggested updates for team approval
- [ ] Integrations with ticketing tools (Zendesk, Jira Service Management)
- [ ] Team dashboards and reporting

## Lessons Learned

## Author

**Kareemah Bahaadur**
Software Engineer | Former Systems Analyst & Technical Support

- GitHub: [@kareemahb](https://github.com/kareemahb)
- LinkedIn: _add link_
