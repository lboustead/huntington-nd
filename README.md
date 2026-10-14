# Huntington Builders

Modern Bismarck home builder website for Huntington Builders, built for Cloudflare.

Source for **https://huntingtonnd.com**. The site uses plain HTML, CSS and JavaScript
with local images and fonts. A dependency-free Cloudflare Worker handles
`POST /api/contact` and sends inquiries through Google Workspace SMTP. There is no database or
application package dependency. Node validates, builds and previews the site.

## Run locally

Use Node 22 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. To check the exact deployment output:

```sh
npm run build
npm run preview
```

`npm run check` verifies document structure, metadata, structured-data JSON,
image alt attributes, and local asset and anchor references. The GitHub Actions
workflow runs the build and retains the static output as an artifact.

## Cloudflare deployment

Production uses the existing **Workers Builds** project `huntington-nd`, connected to
`lboustead/huntington-nd` on branch `main`. Keep build command `npm run build` and the
existing Wrangler deployment command. `wrangler.jsonc` matches that Worker name,
selects `dist/_worker.js` as the private runtime entry and binds static files to
`ASSETS`. Only contact routes run the Worker before assets; other pages retain
native headers, redirects and the custom 404.

The build generates `dist/.assetsignore` so the Worker entry and Pages routing
metadata cannot be uploaded as public assets. Preserve this file when transferring
the complete build output. Existing dashboard variables are retained with
`keep_vars`; configure the SMTP app-password secret on this Worker as described
in [CONTACT-SETUP.md](CONTACT-SETUP.md).

The same output remains compatible with Pages advanced mode: build with
`npm run build`, publish all of `dist`, and retain `_worker.js` and `_routes.json`.
See [DEPLOYMENT.md](DEPLOYMENT.md) for runtime checks and domain-service notes.

## Editing

The palette, type, layout and interaction details are documented in
[DESIGN-NOTES.md](DESIGN-NOTES.md). The homepage opens with a large exterior
photograph, crisp charcoal typography and a slightly larger, easily replaceable logo. Wood-tone accents connect the
brand to the original logo while white and graphite remain the main palette.
The portfolio pairs wide room views with close material details. A short
horizontal opening sequence and a five-second featured-photo carousel lead into varied
scroll entrances. Photos alternate between side entrances, upward lifts and
gentle scale reveals, with short paired delays. Process steps and consultation
details arrive in sequence; mobile uses shorter movement without delays.
Entrances replay when sections return from either scroll direction, with upward
travel mirroring the vertical reveals. Native
expandable introduction steps, gallery filters and a
keyboard-operated photo viewer make the original project photos easy to browse.
The lots-and-homes map loads automatically and keeps its external viewer link.
The featured carousel can be paused and stops while hovered, focused, offscreen
or hidden, and when the device requests reduced motion. Motion
follows the device's reduced-motion preference without a site setting. The footer
groups navigation, social links and the Bismarck address, with a large decorative
wordmark that moves horizontally as the visitor scrolls into the closing section.
Its links and controls stay stationary. Core
content and links work without JavaScript. The refresh adds no application
package dependencies. The contact endpoint requires the Google Workspace SMTP configuration below.

- `index.html`: copy, section order, contact details, links, and metadata.
- `assets/`: styles, browser interactions, photos, icons, and local fonts.
- `robots.txt` and `sitemap.xml`: production crawl settings.
- `_headers`: native Cloudflare asset response headers.
- `_redirects`, when present: mappings for known legacy paths.
- `404.html`: static error page, also preventing Pages' implicit SPA fallback.
- `scripts/`: dependency-free local tooling; excluded from the deployed output.

`dist/` is generated and ignored by Git. The source handler stays in
`functions/api/contact.js`; the build packages it into the default-only Worker
entry. Public HTML and assets are copied separately, with Workers upload
exclusions and Pages API routing metadata. Documentation, tests, environment
files and local tooling stay outside the deployment output.

## Contact and service integrations

The contact section shares BisMan's two-column layout and sends directly through
`/api/contact`. The Function confirms Google Workspace SMTP acceptance before the browser shows
success, preserves fields on failure, and uses a stable Message-ID for retries. Direct phone,
SMS and email links remain available; without JavaScript use these contact links.
No submitted content is logged or stored by the site. Read
[CONTACT-SETUP.md](CONTACT-SETUP.md) before enabling delivery.

See [CONTENT-SOURCES.md](CONTENT-SOURCES.md) for the verified source content and
items to confirm before the domain cutover. Public information and availability
can change; keep those details current as the site evolves.

## Assets

Business photos and branding were brought forward from the existing websites
identified by the owner. Any bundled third-party fonts retain their supplied
license notices in `assets/`. This private repository grants no public license
to the business photography or branding.
