# Huntington design direction

The design takes its cues from Huntington's own photography: open North Dakota
sky, stone, timber and broad rooflines. A large exterior photograph is the main
visual moment. The surrounding page stays quiet, with clear navigation,
generous space and a personal invitation to build.

## Plan and tokens

| Role | Value | Purpose |
| --- | --- | --- |
| White | #ffffff | Main surface and space around photographs |
| Graphite | #252a2d | Type, primary actions and the contact section |
| Slate | #536b78 | Focus rings and interaction feedback |
| Concrete | #f1f3f3 | Lots-and-homes surface |
| Sky grey | #e5ecef | Map preview background |
| Secondary ink | #60696e | Supporting copy |

Locally hosted Manrope is used throughout. Its open geometric forms suit the
architecture, with large, lighter display type and sturdier navigation/body text.
Headings and body copy are left aligned. Supporting text has short reading widths.

```text
Small logo and name         Navigation           Free consultation

Large two-line headline                 Short introduction / location
Wide exterior photograph with one clear portfolio action
Photo caption                            Manual photo controls

Kitchen photograph                      Personal building approach

Portfolio introduction                  Short supporting description
Photo filters
Large interior photograph               Narrow material detail
More project photographs in paired rows

Lots and homes                          Load the real location map
Getting started                         Three expandable steps
Consultation                            Verified contact details
Wordmark                                Social links / motion preference
```

The plan was reviewed against the previous split hero. A wide image now
immediately identifies the business as a builder in its actual landscape.
No decorative feature cards, invented achievements or property listings are
added. The opening portfolio pair uses an interior and a material detail;
the older rendering collage and kitchen remain in the expanded gallery.
The logo stays small, replaceable, and unchanged.

## Motion and interactions

One short page-load sequence introduces the headline and photograph. The
headline settles in from the left, while the short introduction moves in from
the right. Other sections are visible immediately, with no repeated scroll
entrances or automatic carousels. Manual featured-photo changes slide
horizontally in the selected direction over 480 ms after the next image decodes.
The outgoing image is a temporary decorative layer, removed on completion or
interruption. Previous/next controls keep their direction even at the ends.
Gallery filters, expandable photo sets and the native dialog retain keyboard
and screen-reader behavior. The dialog supports arrow keys, Escape and focus
restoration. Native details/summary use short interruptible height transitions.
Mobile menu closure moves focus to a visible destination. The map loads on
request, with an external viewer fallback and a normal embed without JavaScript.

System reduced-motion preferences disable animation, including live preference
changes. The footer control can override motion for the current visit. Core
content, contact actions and project photo links work without JavaScript.
Motion uses CSS and existing native Web Animations APIs. No application
dependencies, remote scripts, or skill files are added.

## Footer refinement

The footer uses the existing graphite, white and slate palette and Manrope.
Four quiet desktop columns group the company introduction, page navigation,
social links and Bismarck address. A larger typographic Huntington signature
forms the closing visual moment; the address, links and controls remain static.
On mobile, navigation sits in two columns beneath the introduction, with the
address and copyright below. The logo asset remains unchanged.

```text
Company / consultation       Explore       Follow along       Visit us

               Large Huntington signature moves sideways with scrolling

Copyright                                          Motion control / back to top
```

The earlier movement required a page load or a photo-control action. This
refinement makes horizontal movement visible during normal scrolling: the
signature travels left across its clipped band as the footer reaches the
viewport, settling at its natural centered position at the document bottom.
It travels up to 280 pixels on desktop and 144 pixels on mobile, and reverses
naturally if the visitor scrolls back. It has no autoplay loop. Reduced motion,
the page motion control and JavaScript-disabled browsing retain a static footer.
The large signature is decorative; the complete company name stays available
as a stationary link. The columns give the footer useful destinations rather
than leaving the wordmark to carry the entire section.

## Assets and content

Original photography, local fonts/licenses, verified contacts and social links
are preserved. Photo captions describe what is visible, rather than inventing
property names or listings. See [CONTENT-SOURCES.md](CONTENT-SOURCES.md).
The redesign adds no form backend and changes no deployment configuration.
