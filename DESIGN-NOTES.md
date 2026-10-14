# Huntington design direction

The design takes its cues from Huntington's own photography: open North Dakota
sky, stone, timber and broad rooflines. A large exterior photograph is the main
visual moment. The surrounding page stays quiet, with clear navigation,
generous space and a personal invitation to build.

## Plan and tokens

| Role | Value | Purpose |
| --- | --- | --- |
| White | #ffffff | Main surface and space around photographs |
| Graphite | #252a2d | Type and primary actions |
| Wood | #b88c68 / #795439 | Small logo-related accents and selected actions |
| Wood wash | #f6f0e9 | Contact surface and a quiet photo caption |
| Slate | #536b78 | Focus rings and interaction feedback |
| Concrete | #f1f3f3 | Lots-and-homes surface |
| Sky grey | #e5ecef | Map preview background |
| Secondary ink | #60696e | Supporting copy |

Locally hosted Manrope is used throughout. Its open geometric forms suit the
architecture, with large, lighter display type and sturdier navigation/body text.
Headings and body copy are left aligned. Supporting text has short reading widths.

```text
Larger logo and name        Navigation           Free consultation

Large two-line headline                 Short introduction / location
Wide exterior photograph with one clear portfolio action
Photo caption                            Carousel controls / pause

Kitchen photograph                      Personal building approach

Portfolio introduction                  Short supporting description
Photo filters
Large interior photograph               Narrow material detail
More project photographs in paired rows

Lots and homes                          Load the real location map
Getting started                         Three expandable steps
Consultation / verified contacts        Inquiry form
Wordmark                                Social links / back to top
```

The plan was reviewed against the previous split hero. A wide image now
immediately identifies the business as a builder in its actual landscape.
No decorative feature cards, invented achievements or property listings are
added. The opening portfolio pair uses an interior and a material detail;
the older rendering collage and kitchen remain in the expanded gallery.
The original logo remains replaceable. Its header size is 56 pixels on desktop
and 46 pixels on mobile, with slightly larger wordmark text. The original wood
color informs a few accents rather than a full warm palette.

## Motion and interactions

One short page-load sequence introduces the headline and photograph. The
headline settles in from the left, while the short introduction moves in from
the right. The approach photo and copy enter from opposite sides, with the copy
following 90 ms later. The portfolio heading lifts into place, then photo rows
alternate between opposing side entrances, upward lifts and a gentle scale
reveal. The direction pattern follows the current filtered photo order, with
90 ms between paired photos. The lots copy lifts while its map settles into
place. The process introduction, three steps and consultation details arrive
upward, with short 90/180 ms delays connecting related items.

Side entrances travel 88 pixels over 650 ms; upward entrances travel 42 pixels
over 550 ms; scale reveals move 24 pixels from 96.5% size over 700 ms. Mobile
uses 32/26/18 pixels, a smaller 98% scale reveal and no stagger delays. Surfaces
replay after leaving the viewport and returning from either direction. Vertical
reveals mirror their offset when returning from the top as visitors scroll up.
The palette, typography and
layout stay consistent; variety comes from the relationships between the actual
photos and content, without bounce or rotation. Featured photos advance every
five seconds while the carousel is visible and the device permits motion.
Pause/Play and previous/next controls remain available. Hover, focus, leaving
the viewport and hiding the tab stop automatic advances; explicit Play can
resume while interacting. Automatic changes do not make live announcements.
Featured-photo changes slide
horizontally in the selected direction over 480 ms after the next image decodes.
The outgoing image is a temporary decorative layer, removed on completion or
interruption. Previous/next controls keep their direction even at the ends.
Gallery filters, expandable photo sets and the native dialog retain keyboard
and screen-reader behavior. The dialog supports arrow keys, Escape and focus
restoration. Native details/summary use short interruptible height transitions.
Mobile menu closure moves focus to a visible destination. The location map
loads automatically, keeps its source with JavaScript enabled or disabled, and
has an external viewer link.

Scroll entrances use IntersectionObserver and CSS transform/opacity transitions.
Compositor hints apply only during an entrance and clear when it ends or is
interrupted. No per-frame JavaScript is added for the new entrance treatments.
Section boundaries clip the movement without creating page-wide horizontal
scrollbars, with room for keyboard focus rings. Focusing a control inside an
entering surface immediately makes that surface visible, and focused surfaces
stay visible. The observer remains attached and resets a surface instantly only
after its entire box leaves the viewport, avoiding visible exit jumps or flicker
at the edge. Gallery filters and expansion register newly displayed photos.
JavaScript-disabled browsing or an
unsupported observer API leaves content visible.

Motion starts on for each new visit unless the device requests reduced motion.
System reduced-motion preferences disable animation, including live preference
changes. There is no page-level motion toggle or stored motion preference. When
the device switches back to normal motion, visible content stays in place and
off-screen content prepares for its next entrance. Core
content, contact actions and project photo links work without JavaScript.
Motion uses CSS and existing native Web Animations APIs. No application
dependencies, remote scripts, or skill files are added.

The contact section uses BisMan's two-column arrangement: verified email,
phone/SMS and address on the left, with the same white inquiry-card layout on
the right. The palette and Manrope typography remain Huntington's. A Pages
Function sends through Google Workspace SMTP; pending, error and accepted states are explicit,
and failures preserve visitor input. Delivery bindings are documented in
CONTACT-SETUP.md.

## Footer refinement

The footer uses the existing graphite, white and slate palette and Manrope.
Four quiet desktop columns group the company introduction, page navigation,
social links and Bismarck address. A larger typographic Huntington signature
forms the closing visual moment; the address, links and controls remain static.
On mobile, navigation sits in two columns beneath the introduction, with the
address and copyright below. The final footer paragraph carries the same
license/ownership disclosure as Atrium, identifying Huntington Builders as the
ownership interest and appending copyright. The logo asset remains unchanged.

```text
Company / consultation       Explore       Follow along       Visit us

               Large Huntington signature moves sideways with scrolling

Copyright                                                        Back to top
```

The earlier movement required a page load or a photo-control action. This
refinement makes horizontal movement visible during normal scrolling: the
signature travels left across its clipped band as the footer reaches the
viewport, settling at its natural centered position at the document bottom.
It travels up to 280 pixels on desktop and 144 pixels on mobile, and reverses
naturally if the visitor scrolls back. It has no autoplay loop. Reduced motion
and JavaScript-disabled browsing retain a static footer.
The large signature is decorative; the complete company name stays available
as a stationary link. The columns give the footer useful destinations rather
than leaving the wordmark to carry the entire section.

## Assets and content

Original photography, local fonts/licenses, verified contacts and social links
are preserved. Photo captions describe what is visible, rather than inventing
property names or listings. See [CONTENT-SOURCES.md](CONTENT-SOURCES.md).
The redesign adds no form backend and changes no deployment configuration.
