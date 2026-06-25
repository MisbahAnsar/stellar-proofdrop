# Proofdrop — Submission Checklist

## Live links

| Item          | URL                                                      |
| ------------- | -------------------------------------------------------- |
| **Live demo** | https://proofdrop-stellar.vercel.app                     |
| **GitHub**    | https://github.com/MisbahAnsar/stellar-proofdrop         |
| **CI**        | https://github.com/MisbahAnsar/stellar-proofdrop/actions |

## Deployed contract (testnet)

| Field             | Value                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Contract ID**   | `CAPVLSAV2KGCGYXGJOGRR5XXBL6BDOV5WOOM64NLNDHUNKHWUIBQEBLC`                                                                           |
| **Initialize tx** | `dcb8c99062bd602c8a414ba0cd0f9843ddc3c04e6bcadda38c34b7afe18b2bf9`                                                                   |
| **Deploy tx**     | `ce9cb3624121b07519e5ef036199e688202d7ceb7b0ae1febac311909748ec74`                                                                   |
| **Explorer**      | [Stellar Expert contract](https://stellar.expert/explorer/testnet/contract/CAPVLSAV2KGCGYXGJOGRR5XXBL6BDOV5WOOM64NLNDHUNKHWUIBQEBLC) |

Full deployment record: [`deployment.testnet.json`](deployment.testnet.json)

## Vercel environment variables

```env
NEXT_PUBLIC_APP_URL=https://proofdrop-stellar.vercel.app
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_PROOFDROP_CONTRACT_ID=CAPVLSAV2KGCGYXGJOGRR5XXBL6BDOV5WOOM64NLNDHUNKHWUIBQEBLC
```

> After setting env vars in Vercel, trigger a **Redeploy** so the build picks them up.

## Requirements coverage

| Requirement                         | Implementation                                                            |
| ----------------------------------- | ------------------------------------------------------------------------- |
| Advanced smart contract development | Escrow lifecycle, proof hash storage, approve/reject, 28 Rust tests       |
| Inter-contract communication        | `token::Client` transfers to/from testnet XLM SAC (`CDLZFC3…`)            |
| Event streaming & real-time updates | Soroban RPC polling + `taskEventBus` + React Query invalidation           |
| CI/CD pipeline                      | GitHub Actions: lint, format, typecheck, frontend + contract tests, build |
| Smart contract deployment workflow  | `bun run deploy:contract` → `docs/deployment.testnet.json`                |
| Mobile responsive frontend          | Responsive navbar, grids, task lists (Tailwind breakpoints)               |
| Error handling & loading states     | Error boundaries, skeletons, transaction status, toasts                   |
| Contract + frontend tests           | 28 contract + 25 frontend Vitest tests                                    |
| Production-ready architecture       | Feature folders, services layer, typed env, thin Soroban client           |
| Documentation                       | README, contracts README, deployment record, demo steps                   |

## Submission checklist

| Item                                    | Status                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------ |
| Public GitHub repository                | ✅                                                                       |
| README with complete documentation      | ✅                                                                       |
| 10+ meaningful commits                  | ✅                                                                       |
| Live demo link                          | ✅ https://proofdrop-stellar.vercel.app                                  |
| Contract deployment address             | ✅ `CAPVLSAV2KGCGYXGJOGRR5XXBL6BDOV5WOOM64NLNDHUNKHWUIBQEBLC`            |
| Transaction hash (contract interaction) | ✅ Initialize: `dcb8c990…` (create_task hash from your demo — see below) |
| Screenshot: mobile responsive UI        | ⬜ **You** — capture on phone or DevTools                                |
| Screenshot: CI/CD running               | ⬜ **You** — GitHub Actions tab                                          |
| Screenshot: 3+ passing tests            | ⬜ **You** — `bun run test:all` terminal or CI log                       |
| Demo video (1–2 min)                    | ⬜ **You** — record create → proof → review flow                         |

## What you must do manually

1. **Vercel** — Paste the env vars above → Redeploy.
2. **Freighter** — Testnet, fund creator + worker via [friendbot](https://laboratory.stellar.org/#account-creator?network=testnet).
3. **Demo flow** — Create task → submit proof → approve; copy the **create_task** transaction hash from the toast/UI for your submission.
4. **Screenshots** — Save to `docs/screenshots/` (mobile home, CI green, test output).
5. **Demo video** — 1–2 min screen recording of the full flow on https://proofdrop-stellar.vercel.app.

## Quick test commands

```bash
bun install
bun run test:all    # 53 tests
bun run ci          # full pipeline
bun run deploy:contract   # redeploy contract (optional)
```
