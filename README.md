# Runlayer Demo

An interactive product demo for **Runlayer** — a connector management platform that lets teams browse, request, and govern MCP (Model Context Protocol) server integrations.

## What it demos

The app simulates two perspectives:

- **User view** — Browse a catalog of hosted and local MCP connectors (Slack, Figma, GitHub, Linear, and more), request access to new ones, and track pending requests.
- **Admin view** — Review and approve or reject connector access requests submitted by users.

Key flows:
1. User lands on the connectors page, sees their active connections.
2. User clicks "Request new" to browse the catalog and submit an access request with justification.
3. Admin receives a notification, opens the review modal, and approves or rejects.
4. User sees their request status update in real time (via localStorage-backed state).

## Tech stack

- **Next.js** (App Router)
- **Tailwind CSS** + shadcn/ui components
- **Framer Motion** for page transitions and panel animations
- **Geist** font

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/connectors` by default.

To switch to the admin view, navigate to `/connectors/admin` or `/settings/requests/admin`.
