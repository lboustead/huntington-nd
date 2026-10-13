# Huntington design direction

The homepage puts Huntington's original home photography beside clear, spacious
type. Soft white, pine green and pale sage keep the page calm; the rooms and
materials provide the warmth. Manrope is the single typeface for headings,
navigation and body copy. Headings use a large, tightly spaced scale, with
shorter reading widths for supporting text.

The distinctive moment is the split hero: a generous, left-aligned headline
beside a large photograph, with its caption and manual controls beneath. The
remaining sections support that composition with quiet surfaces, selective
rounded corners and varied photo proportions. Labels describe the section;
numbers appear only in the three-step introduction to building a home.

## Design tokens

| Role | Value | Use |
| --- | --- | --- |
| Soft white | `#f6f7f3` | Main page surface |
| White | `#ffffff` | Portfolio surface and light controls |
| Pine | `#253b35` | Primary text, buttons, contact section and footer |
| Leaf | `#486557` | Supporting accents and interaction feedback |
| Sage grey | `#62716b` | Secondary text |
| Pale sage | `#e9ede5` | Photo note and lots-and-homes section |

The desktop content width is capped at 1328 pixels. Main sections use 112-pixel
vertical spacing, reducing to 64 pixels on small screens. The desktop hero uses
an approximately 42/58 text-to-photo split; it becomes a single column below
680 pixels. Navigation becomes a disclosure menu below 900 pixels. Body text
remains left aligned, and headings balance their lines where supported.

```text
Logo and name       Navigation                 Let's talk

Home-building headline         Large project photograph
Introduction and actions       Caption + manual photo controls

                     Three brief principles

Approach headline              Homeowner involvement
Wide kitchen photograph        Pale-sage note

Portfolio heading              Short introduction
Filters and photo count
Project photography in two varied columns

Lots and homes                 Location card / load Google Maps
Conversation introduction      Three expandable steps
Consultation and contact details on pine
Wordmark, social links and motion preference
```

The existing logo stays small and in a stable position in the sticky header.
Its image is separate from the text wordmark, so a future logo can replace
`assets/huntington-logo.png` without redesigning the hero. Original photography
and verified company information are preserved. No testimonials, project totals,
awards or individual property availability claims have been added.

## Interactions and motion

The initial hero composition enters once with a 14-pixel movement and opacity
change: 550 ms for the text and 650 ms for the photo frame. Three targeted
surfaces reveal once on entering the viewport: the approach photograph, the
portfolio heading and the lots-and-homes introduction. Those reveals move
12 pixels over no more than 450 ms. Other sections and gallery cards remain
visible as the visitor reads.

The hero's three photographs change only when a visitor chooses a dot or uses
the previous/next controls. Images are decoded before display, then fade over
350 ms. Captions, selected-button state, photo count and a screen-reader
announcement update together. There is no automatic slideshow.

Gallery filters select all projects, exteriors, interiors or commercial photos.
The first six matching photographs are shown initially; the visitor can expand
the complete matching set. The native dialog viewer supports previous/next
buttons, left/right arrow keys and Escape, and returns focus to its opening
photo when closed. Photo hover movement is limited to a small scale change on
devices that support hover.

The three introduction steps retain native `details` and `summary` behavior.
With JavaScript and Web Animations available, their height transitions over
320 ms, reverses from the current position on repeated activation, and settles
on resize or a motion-preference change. The mobile navigation shows its state
through its disclosure button and short surface transition, with Escape to
close. Closed mobile navigation is removed from keyboard interaction.

The lots-and-homes location card loads the existing Google My Maps embed after
an explicit action. The external viewer link remains available alongside it.
Without JavaScript, the embedded map and viewer link remain accessible.
Availability is confirmed with the team rather than inferred from photography.

Reduced-motion preferences disable entrances, reveals and animated transitions
by default, including when the operating-system preference changes during a
visit. The footer's “Motion on/off” control can override that preference for the
current visit; it does not store a preference. Core content, photo links,
navigation, contact actions and native expandable steps remain usable without
JavaScript.

The implementation uses CSS and native browser APIs with no new application
dependencies. It keeps scroll updates to the thin progress indicator and the
sticky header's surface state. The original logo and photographs are unchanged,
and no deployment is part of this design refresh.

## Fonts and assets

Manrope is hosted locally, with its supplied license retained in
`assets/manrope-OFL.txt`. The previous Newsreader font and license are retained
in the asset folder but are not loaded by the current stylesheet. Existing
image source details and contact verification are recorded in
[CONTENT-SOURCES.md](CONTENT-SOURCES.md).
