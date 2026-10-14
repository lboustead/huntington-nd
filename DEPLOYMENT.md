# Cloudflare deployment

Target domain: **huntingtonnd.com**
GitHub repository: **https://github.com/lboustead/huntington-nd**
Existing production Worker: **`huntington-nd`**

## Existing Workers Builds pipeline

The Cloudflare deployment checks identify Workers Builds for this project.
Keep the existing Git connection, branch `main`, build command `npm run build`
and Wrangler deployment command. No new application or hosting migration is
required.

`wrangler.jsonc` matches the existing Worker name and configures:

- Private runtime entry: `dist/_worker.js`.
- Native static assets: `dist`, bound as `ASSETS`.
- Worker-first routes: `/api/contact` and `/api/contact/*`.
- Custom static 404 handling and preservation of dashboard variables.

The build writes `.assetsignore` inside `dist` to exclude `_worker.js` and
Pages-only `_routes.json` from public asset upload. Preserve this dotfile when
transferring the complete build output. The GitHub artifact includes hidden
files; the build whitelist excludes environment files, tests and local tooling.
Native `_headers` and `_redirects`, when present, stay with static assets.

After the Cloudflare build succeeds, `GET /api/contact` should return JSON with
status **405** and `Allow: POST`. A 404 means the runtime route is not deployed.
Also check a normal page, a local asset and a missing URL; the latter should
return the custom 404. GitHub's validation build and Cloudflare's production
build are separate checks.

## Pages-compatible output

The same `dist` output supports Pages advanced mode. For a Pages project, use
build command `npm run build` and output directory `dist`, retaining the generated
`_worker.js` and API-only `_routes.json`. Pages recognizes the runtime file and
provides `ASSETS` automatically. Root `functions/` contains the shared source;
its compilation is not required when publishing the generated entry.

## Contact delivery

Follow [CONTACT-SETUP.md](CONTACT-SETUP.md) to configure Google Workspace SMTP on
the existing production Worker. The app password is an encrypted `SMTP_PASSWORD`
secret. Sender defaults to `noreply@huntingtonnd.com`; recipient defaults to
`builders@huntingtonnd.com`. Redeploy after changing bindings, then intentionally submit a
message and confirm receipt. Runtime availability does not establish mailbox
authentication or delivery.

## Preserve domain services

Keep existing custom domains and DNS unchanged. Preserve MX, SPF, DKIM, DMARC
and service-verification records; website code does not recreate mail service.
If domain settings need changes later, record the existing zone first and treat
that handoff separately from a code deployment.

## Updates and rollback

Pushing to `main` triggers the connected production build. Revert a commit and
push to undo a code change, or use an earlier successful Cloudflare deployment.
Keep business content, availability and contact details current; see
[CONTENT-SOURCES.md](CONTENT-SOURCES.md).

## Cloudflare documentation

- [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- [Asset exclusions](https://developers.cloudflare.com/workers/static-assets/configuration/)
- [Pages advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/)
