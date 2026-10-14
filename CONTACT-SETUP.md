# Contact delivery

The contact form for Huntington Builders submits to the Cloudflare Worker at
`/api/contact`. It sends through the owner's Google Workspace mailbox,
`noreply@huntingtonnd.com`, using an app password over TLS. Recipients default to
`builders@huntingtonnd.com`; the visitor's email is the reply-to address.

## Enable delivery on the existing Worker

The production deployment is the existing Workers Builds project `huntington-nd`.
Keep build command `npm run build` and its Wrangler deployment command.
`wrangler.jsonc` points to the generated `dist/_worker.js`, binds native assets
and runs the contact API first. `dist/.assetsignore` prevents uploading runtime
code as a public asset; include it when transferring the complete build output.
The Worker uses Cloudflare's native TCP sockets, with no SMTP package or
separate server. The same output also supports Pages advanced mode through
`_worker.js` and API-only `_routes.json`.

In this Worker's **Settings → Variables and Secrets**, set:

| Name | Value |
| --- | --- |
| `SMTP_PASSWORD` | The mailbox's app password, saved as an encrypted secret |
| `SMTP_USERNAME` | Optional; defaults to `noreply@huntingtonnd.com` |
| `SMTP_HOST` | Optional; defaults to `smtp.gmail.com` |
| `SMTP_PORT` | Optional; defaults to `465` for direct TLS; `587` uses STARTTLS |
| `CONTACT_FROM_EMAIL` | Optional; defaults to the authenticated mailbox |
| `CONTACT_TO_EMAIL` | Optional; defaults to `builders@huntingtonnd.com` |

Google displays app passwords in groups; paste the 16 characters without the
display spaces. Keep the password in secure settings, outside browser code and
Git. Configure the production Worker and any separate preview deployment, then
redeploy the current commit to apply the bindings. `keep_vars` retains existing
dashboard variables, and Wrangler preserves encrypted secrets. A sending API key from another provider is not
needed. An app password must be valid for this mailbox; its existence cannot be
verified from public mail records.

The domain's public MX records identify Google Workspace. The Worker requires
TLS on port 465 or STARTTLS before authentication on port 587, verifies the SMTP
server's responses and only reports success after the server accepts the message.
SMTP acceptance does not guarantee inbox delivery. Test receipt with a message
you intentionally submit after configuring the password.

Missing configuration or SMTP failure returns an honest error and preserves
visitor input, with direct phone, SMS and email links available. No submitted
messages or credentials are logged or stored by this site. Retries use a stable
Message-ID for identification; SMTP does not guarantee duplicate suppression.

## Local validation

The build runs protocol and form validation tests without connecting to SMTP.
For browser success testing without sending email:

```sh
CONTACT_DEV_MOCK=1 npm run dev
```

This mock is confined to the development server. Production requests and bindings
cannot enable it. `.env` and `.dev.vars` files are ignored. The `startedAt` field
is a stable retry token; client clock differences do not block valid messages.
The endpoint checks origin, body size/types and a hidden honeypot. Cloudflare
rate limiting for `POST /api/contact` can supplement these checks for abuse.

References: [Workers static assets](https://developers.cloudflare.com/workers/static-assets/),
[Pages advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/),
[Cloudflare TCP sockets](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/),
[Google Workspace SMTP](https://support.google.com/a/answer/176600),
[Google app passwords](https://support.google.com/accounts/answer/185833).
