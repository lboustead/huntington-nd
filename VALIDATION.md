# Validation record

Verified on October 12, 2026 in the supplied development environment.

- `npm ci` completed with no package dependencies.
- `npm run build` passed source and generated-output checks.
- Browser JavaScript syntax checks passed.
- Chromium checks passed at widths 1440, 390, and 320 pixels: image loading,
  asset responses, no JavaScript errors, no horizontal overflow, labels,
  mobile menu interaction, and any gallery keyboard/focus behavior.
- Direct contact links and navigation remained usable without JavaScript.
- Missing routes returned the custom HTTP 404 page with a usable home link;
  robots.txt and sitemap.xml returned HTTP 200.
- Visual review confirmed original photography, readable responsive layouts,
  and cross-platform SVG action icons.

Checks were run against the exact static deployment output in `dist/`. The
GitHub Actions workflow repeats the static build on pushes and pull requests;
check the repository's Actions tab for its latest result. Cloudflare deployment
has not been performed. Booking and property transactions remain with existing external
providers; verification did not create reservations or contact the business.

The browser labels check is a targeted implementation check, not a complete
accessibility certification. `npm run check` and `npm run build` are available
in this repository for future source validation.
