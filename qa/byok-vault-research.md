# BYOK Vault research note

Date: 2026-08-24

Supabase’s official Vault documentation describes Vault as encrypted secret storage in Postgres. It documents `vault.create_secret()`, `vault.update_secret()`, the encrypted `vault.secrets` table, and the decrypted `vault.decrypted_secrets` view. The documentation emphasizes restricting access to decrypted secrets. Source: [Supabase Vault documentation](https://supabase.com/docs/guides/database/vault).

The official page did not expose a `delete_secret` function in the extracted content. The initial BYOK migration therefore should avoid assuming an undocumented delete API. Provider replacement can use a server-side `vault.update_secret()` path when available, and provider removal should first remove the metadata reference and be treated as requiring staging validation of the target project’s Vault extension behavior before production. The browser must never query `vault.decrypted_secrets` or receive a raw provider key.
