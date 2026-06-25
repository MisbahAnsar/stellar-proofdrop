# Proofdrop — Submission Checklist

## Live links

| Item          | URL                                                      |
| ------------- | -------------------------------------------------------- |
| **Live demo** | https://proofdrop-stellar.vercel.app                     |
| **GitHub**    | https://github.com/MisbahAnsar/stellar-proofdrop         |
| **CI**        | https://github.com/MisbahAnsar/stellar-proofdrop/actions |

## Demo transactions (testnet)

| Action       | Link                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| Create task  | https://stellar.expert/explorer/testnet/tx/b03dbaa8987faf96404ed49412fdfe2f085f76a8344d069d49ece253af21e2e3 |
| Task #2 (UI) | https://proofdrop-stellar.vercel.app/tasks/2                                                                |
| Contract     | https://stellar.expert/explorer/testnet/contract/CAPVLSAV2KGCGYXGJOGRR5XXBL6BDOV5WOOM64NLNDHUNKHWUIBQEBLC   |

More detail: [`demo-transactions.md`](demo-transactions.md)

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

## Submission checklist

| Item                                    | Status                                                                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Public GitHub repository                | ✅                                                                                                                               |
| README with complete documentation      | ✅                                                                                                                               |
| 10+ meaningful commits                  | ✅                                                                                                                               |
| Live demo link                          | ✅ https://proofdrop-stellar.vercel.app                                                                                          |
| Contract deployment address             | ✅ `CAPVLSAV2KGCGYXGJOGRR5XXBL6BDOV5WOOM64NLNDHUNKHWUIBQEBLC`                                                                    |
| Transaction hash (contract interaction) | ✅ [Create task tx](https://stellar.expert/explorer/testnet/tx/b03dbaa8987faf96404ed49412fdfe2f085f76a8344d069d49ece253af21e2e3) |
| CI/CD                                   | ✅ [GitHub Actions](https://github.com/MisbahAnsar/stellar-proofdrop/actions)                                                    |
| 3+ passing tests                        | ✅ 53 tests                                                                                                                      |
| Demo video (1–2 min)                    | ⬜ Add link when ready                                                                                                           |

## Quick test commands

```bash
bun install
bun run test:all    # 53 tests
bun run ci          # full pipeline
bun run deploy:contract   # redeploy contract (optional)
```
