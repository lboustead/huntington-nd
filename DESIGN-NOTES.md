# Huntington design direction

The site combines charcoal and olive surfaces, copper accents drawn from the owner's wood-grain logo, oversized Manrope headings, italic Newsreader accents, and original project photography. The compact header keeps the centered navigation, social links, and booking action visible while scrolling.

## Online references

These reference pages were retrieved online during the redesign:

- [Codrops: Scroll Text Motion](https://github.com/codrops/ScrollTextMotion): large typography and controlled movement through a page.
- [Codrops: EaseReverse Clip Menu](https://github.com/codrops/EaseReverseClipMenu): intentional opening, closing, and hover interactions.
- [Codrops: On-Scroll Layout Formations](https://github.com/codrops/OnScrollLayoutFormations): photography arranged as an editorial composition.
- [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API): observing sections and gallery cards as they enter the viewport.
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): respecting visitor motion preferences.

The redesign adapts these ideas using native browser features. It does not include source code or dependencies from the Codrops examples.

## Interactions

The hero has three manually selectable project views, accessible previous/next controls, and a live announcement when the visitor changes the photo. Scrolling reveals content, gently shifts the desktop hero photograph, fills the progress indicator, and changes the sticky header's surface. Project filters, the full gallery, and the keyboard-operated photo viewer remain available. Native expandable sections introduce the initial conversation about building a home.

Small headline entrances, hover responses, and a bounded 70 ms gallery stagger add movement without new media or animation dependencies. The introduction sections animate their height over 320 ms on activation, reverse smoothly on repeated clicks, and settle immediately on resize or a change to reduced motion. They still use native `details` and `summary` when JavaScript or Web Animations is unavailable.

The top of the hero blends into the header with a matching green gradient. The original logo starts as a prominent badge extending into the hero, then shrinks into its header position over the first 160 pixels of desktop scrolling or 120 on mobile. Its top-left corner stays fixed, and the header keeps its existing height. Opening the mobile menu compacts the badge to keep links clear; closing it restores its size for the current scroll position. Reduced-motion and JavaScript-disabled visits use the compact logo.

Selected kitchen and gallery photos, the copper photo note, the project heading, and small decorative symbols move gently as their sections cross the viewport. The effects use bounded transforms, cropped image frames, and the existing frame-throttled scroll handler. Measurements are batched before style updates. No media downloads or animation libraries were added.

The footer uses a smaller, linked HUNTINGTON BUILDERS wordmark with one combined area for the tagline, copyright, social links, and back-to-top link.

Reduced-motion settings disable parallax and entrance effects, including when the preference changes during a visit. With JavaScript unavailable, all content and project photos remain visible, links remain usable, and the expandable sections still work.

## Fonts

Manrope and Newsreader are hosted locally from the Google Fonts repository. Their original SIL Open Font License notices are retained in `assets/manrope-OFL.txt` and `assets/newsreader-OFL.txt`. The owner-provided logo and original project photographs are unchanged.
