# Huntington Builders

Modern Bismarck home builder website for Huntington Builders, built for Cloudflare Pages.

Source for **https://huntingtonnd.com**. This is a front-end-only website: plain HTML,
CSS, and JavaScript with locally hosted images and fonts. There are no runtime
packages, server functions, database, or secrets. Node is used only to validate,
copy, and preview the static files.

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
| Runtime environment variables | None |

The first deployment gets a `pages.dev` address. Review that deployment before
attaching `huntingtonnd.com` and `www.huntingtonnd.com` through the Pages project's **Custom
domains** settings. Subsequent commits to `main` deploy automatically after the
Git integration is connected. See [DEPLOYMENT.md](DEPLOYMENT.md) for the domain
handoff checklist.

## Editing

The palette, type, layout and interaction details are documented in
[DESIGN-NOTES.md](DESIGN-NOTES.md). The homepage combines a spacious split hero,
original project photography and a small, easily replaceable logo. It includes
three manually browsable hero photos, three targeted once-only reveals, gallery
filters, a keyboard-operated photo viewer and native expandable introduction
steps. The lots-and-homes card loads Google Maps on request and retains an
external viewer link; without JavaScript, the embedded map remains available.
Motion respects the visitor's reduced-motion setting and can be toggled in the
footer. Core content and links work without JavaScript. The refresh adds no
application dependencies or deployment changes.

- `index.html`: copy, section order, contact details, links, and metadata.
- `assets/`: styles, browser interactions, photos, icons, and local fonts.
- `robots.txt` and `sitemap.xml`: production crawl settings.
- `_headers`: Cloudflare Pages response headers.
- `_redirects`, when present: mappings for known legacy paths.
- `404.html`: static error page, also preventing Pages' implicit SPA fallback.
- `scripts/`: dependency-free local tooling; excluded from the deployed output.

`dist/` is generated and ignored by Git. The build copies only public HTML,
assets, and Pages configuration files, keeping project documentation and tooling
outside the deployment.

## Contact and service integrations

The website preserves verified phone, email, and service-provider links from
the existing public site. Email actions open the visitor's email app; this
repository does not receive or store submissions. External property searches,
booking apps, and maps remain hosted by their existing providers.

See [CONTENT-SOURCES.md](CONTENT-SOURCES.md) for the verified source content and
items to confirm before the domain cutover. Public information and availability
can change; keep those details current as the site evolves.

## Assets

Business photos and branding were brought forward from the existing websites
identified by the owner. Any bundled third-party fonts retain their supplied
license notices in `assets/`. This private repository grants no public license
to the business photography or branding.
