# Validation record

Verified on October 12, 2026 in the supplied development environment.

## Logo docking, scroll motion, and merged footer

- The featured logo measures 196 pixels on desktop and approximately 148 on mobile at the top, then docks at 98 and 82 respectively. Continuous intermediate sizes were checked across seven widths and an additional short mobile viewport; its top-left corner stays fixed and it does not overlap the headline or header actions. Header heights remain 106 and 91 pixels.
- Opening the mobile menu compacts the logo so all links remain visible and clickable. Real mouse/Enter activation, Escape/focus restoration, outside clicks, navigation links, and restoring the correct logo size for the current scroll position pass.
- Kitchen/gallery photos, the copper note, the project heading, and decorative symbols move with actual scrolling within their bounded ranges. Cropped frames cover the image movement. Reduced motion resets these effects and keeps the logo compact; JavaScript-disabled visits retain static content and the compact logo.
- The tagline, copyright, social links, and back-to-top link now share one footer area. There is no circular footer logo, duplicate bottom row, or horizontal overflow.
- Gallery, photo viewer, mobile navigation, and smooth accordion regression checks pass. Desktop/mobile screenshots were reviewed. No libraries or media were added.

The static build, JavaScript syntax check, and Git whitespace checks pass. Browser/preview processes used for validation were stopped.

## Header, motion, and footer refinement

- Browser checks confirm a borderless header and matching hero/header green on desktop and mobile; compact header heights remain 106 and 91 pixels.
- Dropdown opening and closing were measured during the animation, confirming intermediate heights before they settle. Rapid reversal, real Enter/Space activation, resize during animation, and reduced-motion changes all pass. Temporary height/overflow styles and height animations are cleaned up.
- The smaller HUNTINGTON BUILDERS footer has no circular logo or decorative wordmark arrow. Its height is approximately 304 pixels at 1440 pixels wide, 245 at 390, and 298 at 320, with no horizontal overflow and working social/home/back-to-top links.
- Core browser regressions pass, including navigation, hero controls, gallery/photo viewer, all 18 remaining homepage images, custom 404, and native dropdowns with JavaScript disabled. Desktop/mobile screenshots were reviewed.
- No libraries or media assets were added. The additional CSS/JavaScript is approximately 777 bytes when gzip-compressed; this measures code size rather than visitor download speed.

The static build, JavaScript syntax check, and Git whitespace checks pass. The external Google map service remains outside the scope of local browser validation.

## Dark redesign validation

The completed redesign passed all 18 browser checks against the generated `dist/` site:

- Responsive layouts at 1440, 1024, 901, 900, 768, 390, and 320 pixels, with no horizontal overflow or overlapping hero controls. Header height stays 106 pixels on desktop and 91 pixels on mobile; the logo stays 98 and 82 pixels respectively.
- All 19 homepage images loaded and decoded, including the original circular logo. Desktop and mobile screenshots were reviewed.
- Mobile navigation opens and closes with its toggle, links, outside clicks, and Escape, with focus restored appropriately.
- Gallery filtering returns 2 exterior, 9 interior, and 4 commercial photos. Expansion exposes all 15 photos; resetting the filter restores its default view.
- The photo viewer supports previous/next controls, arrow keys, Escape, scroll-lock cleanup, and focus restoration.
- Hero project selection wraps correctly and rapid repeated selections settle on the final image without residual animation.
- Scroll reveals, progress indication, sticky-header state, and desktop image movement work. Reduced motion disables entrance effects and parallax, and changing the preference cancels a running hero transition.
- Native introduction sections work with real mouse clicks and keyboard Enter.
- Without JavaScript, content, contact links, navigation, all 15 project links, and native expandable sections remain usable.
- The custom missing-page response returns HTTP 404 with a usable home link. The phone number, street address, map embed URL, and map fallback link remain present and correct.

`npm run build`, browser JavaScript syntax validation, and `git diff --check` passed. No unexpected browser errors were observed. The external Google frame was blocked during browser testing to respect the cloud network policy; these checks validate the embed's site integration rather than Google's live map service.

## Earlier static-site validation

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
check the repository's Actions tab for its latest result. Booking and property transactions remain with existing external
providers; verification did not create reservations or contact the business.

The browser labels check is a targeted implementation check, not a complete
accessibility certification. `npm run check` and `npm run build` are available
in this repository for future source validation.
