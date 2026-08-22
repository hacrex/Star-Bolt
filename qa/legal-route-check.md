# Legal route QA

Verified in the fresh Vite preview on port 5175:

| Route | Result | Verified content |
|---|---|---|
| `/terms` | Pass | Dedicated “Terms of use” document with service, contributions, accounts, and contact sections. |
| `/privacy` | Pass | Dedicated “Privacy notice” document with information, use, storage/deletion, and contact sections. |

Both pages preserve the shared Star Lyrix header, legal surface, footer navigation, and Stitch warm charcoal/gold styling.

| Route | Result | Verified content |
|---|---|---|
| `/copyright` | Pass | Dedicated “Copyright & DMCA” document with reporting, good-faith, test-content, and counter-notice sections. |
| `/community-guidelines` | Pass | Dedicated “Community guidelines” document with constructive conduct, boundaries, honest labeling, and reporting sections. |

All four legal routes render distinct document content while sharing the same navigation and visual shell.

## Signup QA

The `/auth` page switches to signup mode successfully. The Username input renders with the hint `3-30 characters: letters, numbers, hyphens, underscores`, confirming the updated validation field is present. No invalid-regex message appeared during the route render or mode switch. Actual account creation remains blocked by the previously observed Supabase email rate limit and was not retried with credentials.

Browser console check: signup mode emitted only the pre-existing React Router v7 future-flag advisories. The prior `Pattern attribute value ... is not a valid regular expression` warning did not appear.

## Catalog QA

The checked-in JSON contains exactly 30 records: 10 `hi`, 10 `en`, and 10 `ta`. All 30 records contain non-empty original lyrics. The seed script passes `node --check`; it was not executed because this workspace has no Supabase service-role credential or valid seed profile ID.
