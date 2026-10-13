# Validation record

Latest verification: October 13, 2026 in the supplied development environment.

## Current light homepage refresh

- The source and generated-output static build checks pass for both HTML pages.
- All 26 final browser checks pass at 1440, 768, 390 and 320 pixels wide,
  covering navigation, hero photos, gallery filters/expansion, keyboard photo
  viewing and focus restoration, native details, reduced motion, JavaScript
  fallback, asset loading and horizontal overflow.
- A separate smoke check of the generated site passes homepage/custom404, hero
  photo changes, exterior filtering, the dialog and focus return, and the initial
  map panel. Generated HTML, CSS and JavaScript match the source files.
- The current design uses a stable, small header logo, a split hero and three
  targeted reveals. The earlier moving-logo and parallax checks below describe
  previous designs and do not establish behavior of the current homepage.
- The original photographs and company contact details remain in place. This
  refresh added no application dependencies and performed no deployment.

The map panel makes no Google Maps request before activation. Its load action
sets the original embed URL, displays the iframe, hides the placeholder and
retains the external viewer link. The load UI was checked with a mocked response;
Google's live service could not be validated because the environment proxy
blocks the embed request. This is an external validation limit, not a passing
live-map test. JavaScript syntax and Git whitespace checks also pass.

## Historical design verification

The following records apply to earlier designs. Keep them as history, rather
than as requirements or results for the current homepage.

### Large centered logo and visible scroll movement — October 13, 2026

- Browser checks passed across 11 layouts, including 1920, 1600, 1440, 1226, 600, 390, and 320 pixels wide and a short 390 × 568 viewport. The logo starts at 260 pixels on desktop, centered over the left hero panel, or 180 pixels centered below the mobile navbar. Halfway scrolling produces intermediate sizes of 179 and 131 pixels with the corresponding translation; full docking produces 98 and 82 pixels. Header heights remain 106 and 91 pixels.
- The initial badge stays clear of the eyebrow and navigation, and the main action stays above the hero controls. No horizontal overflow or circular-logo collisions were observed. Real mouse/Enter menu activation compacts the badge, while Escape restores its correct top or intermediate scroll position after the scheduled frame.
- Over 200 pixels of actual scrolling, the kitchen photograph moves approximately 15.39 pixels and the copper callout moves 11.08 pixels in the opposite direction. Cropped frames cover the stronger photo movement without exposing empty edges.
- Reduced motion retains the large initial badge, docks it discretely after 40 pixels, and disables parallax. The visitor's motion toggle can explicitly enable animation under an OS reduced-motion preference or pause it again. JavaScript-disabled visits show a loaded, prominent static hero badge and usable content.
- Gallery filtering, the photo viewer, smooth expandable sections, the merged footer, and browser runtime checks pass. Desktop and mobile screenshots were reviewed. No new libraries or media assets were added; CSS/JavaScript cache versions were updated.

The static build, JavaScript syntax check, and Git whitespace checks pass. The Google frame was blocked during local browser checks; Google's live map service was not tested.

## Previous verification — October 12, 2026

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
