# FinanceTracker — Frontend

React + TypeScript + Tailwind CSS v4 frontend for FinanceTracker, a personal finance tracker: manage checking/savings/investment accounts and credit cards, upload PDF statements for AI-powered extraction, and track transactions.

Backend repo: [financetracker-backend-dotnet](https://github.com/kesavanpotti-dharshan/financetracker-backend-dotnet)

## Tech stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS v4 (CSS-first config via `@tailwindcss/vite`)
- React Router for client-side routing
- JWT auth with httpOnly-cookie refresh token rotation, backed by a small fetch wrapper with auto-refresh on 401

## Features

- Auth: register, login, silent session restore on page load, logout
- Accounts: create/update/archive checking, savings, investment accounts
- Credit cards: limit, statement/due day, minimum payment, interest rate, available credit
- Statements: upload a PDF, AI (Gemini) extracts balance/due date/transactions, review and confirm before it's saved
- Transactions: auto-populated from confirmed statements, plus manual add/delete, with a current-month total

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

Requires the [backend](https://github.com/kesavanpotti-dharshan/financetracker-backend-dotnet) running locally or deployed, and its URL set in `.env`.

## Environment variables

| Variable       | Description                                                                              |
| -------------- | ---------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the FinanceTracker backend API (e.g. `https://localhost:7271` for local dev) |

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally

## Status

Personal-use project, actively developed. Not yet deployed.
