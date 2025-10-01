# Security and Secrets

This repository may contain environment variables that are sensitive. Follow these rules:

- Never commit `.env.local` or other files that contain secrets. Use `.env.local.example` for examples.
- If a secret is accidentally committed, rotate/revoke it immediately and remove it from the history (use BFG or `git filter-repo`).
- Store production secrets in your hosting provider's secret manager (Vercel, Firebase, GCP Secret Manager, AWS Secrets Manager, etc.).
- For payment gateways (CinetPay), don't expose secret keys to the client. Use server-side routes or cloud functions to sign/handle requests.

How to rotate a secret quickly:

1. Revoke the exposed key in the provider console.
2. Create a new key and store it in the secret manager.
3. Update `.env` for local dev and update the hosting settings.
4. Remove the secret from Git history if it was committed.

If you need help performing any of these steps, ask and include which keys you want to rotate.
