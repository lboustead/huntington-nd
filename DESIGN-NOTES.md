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

Reduced-motion settings disable parallax and entrance effects, including when the preference changes during a visit. With JavaScript unavailable, all content and project photos remain visible, links remain usable, and the expandable sections still work.

## Fonts

Manrope and Newsreader are hosted locally from the Google Fonts repository. Their original SIL Open Font License notices are retained in `assets/manrope-OFL.txt` and `assets/newsreader-OFL.txt`. The owner-provided logo and original project photographs are unchanged.
