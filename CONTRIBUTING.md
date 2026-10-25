# Contributing to SkeoTrace

Thanks for helping make food supply chains more transparent! Code, docs, design and supply-chain domain knowledge are all welcome.

## Getting started

1. Pick an issue labelled [`good first issue`](https://github.com/skdas20/SkeoTrace/labels/good%20first%20issue), or [`help wanted`](https://github.com/skdas20/SkeoTrace/labels/help%20wanted) for bigger work, and comment that you're taking it.
2. Fork the repo and set it up as described in the README's **Quick start** (Node.js 18+ and MongoDB).
3. Create a branch: `git checkout -b fix/short-description`.

## Where things live

| Area | Path |
| --- | --- |
| API routes | `backend/src/routes/` |
| Batch lifecycle logic | `backend/src/services/batch.ts` |
| Ledger (hash chain, Merkle root) | `backend/src/services/blockchain.ts`, `backend/src/utils/merkle.ts` |
| Auth and role checks | `backend/src/middleware/auth.ts`, `backend/src/middleware/rbac.ts` |
| Dashboards and pages | `frontend/src/pages/` |
| API client | `frontend/src/lib/api.ts` |

## Before opening a PR

- `cd backend && npm run build` and `cd frontend && npm run build` both pass (CI runs them too).
- One focused change per PR, linked to its issue (`Fixes #12`).
- Describe how you tested it; screenshots help for UI changes.
- Never commit `.env` files, database URIs or real credentials.

## Code of conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).
