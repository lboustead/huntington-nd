# Huntington Builders

Modern Bismarck home builder website for Huntington Builders, built for Cloudflare Pages.

Source for **https://huntingtonnd.com**. The site uses plain HTML, CSS and JavaScript
with local images and fonts. A dependency-free Cloudflare Pages Function handles
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

## Deploy on Cloudflare Pages

Connect this GitHub repository through **Workers & Pages → Create application →
Pages → Connect to Git** (dashboard wording may vary). Grant the Cloudflare GitHub
app access to this repository.

| Setting | Value |
| --- | --- |
| Repository | `lboustead/huntington-nd` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Leave blank |
| Node version | `22` (the repository includes `.node-version`) |
| Function configuration | `SMTP_PASSWORD` and optional mail settings; see [CONTACT-SETUP.md](CONTACT-SETUP.md) |

The first deployment gets a `pages.dev` address. Review that deployment before
attaching `huntingtonnd.com` and `www.huntingtonnd.com` through the Pages project's **Custom
domains** settings. Subsequent commits to `main` deploy automatically after the
Git integration is connected. See [DEPLOYMENT.md](DEPLOYMENT.md) for the domain
handoff checklist.

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
- `_headers`: Cloudflare Pages response headers.
- `_redirects`, when present: mappings for known legacy paths.
- `404.html`: static error page, also preventing Pages' implicit SPA fallback.
- `scripts/`: dependency-free local tooling; excluded from the deployed output.

`dist/` is generated and ignored by Git. The build copies public HTML, assets and Pages configuration to `dist/`.
Cloudflare compiles `functions/` from the repository root; the generated routing
file invokes the Function only for `/api/contact`. Documentation, tests and local
tooling stay outside the public files.

## Contact and service integrations

The contact section shares BisMan's two-column layout and sends directly through
`/api/contact`. The Function confirms Google Workspace SMTP acceptance before the browser shows
success, preserves fields on failure, and uses stable retry keys. Direct phone,
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
