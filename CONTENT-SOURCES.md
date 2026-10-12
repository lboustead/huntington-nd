# Content and asset sources

Reviewed the existing public website at <https://huntingtonnd.com/> on October 12, 2026. The redesign uses the original site's company information and project photography. Display titles for gallery photos describe what is visible; they are not property names or sale listings.

## Verified company information

- Name: Huntington Builders.
- Focus: quality construction and home building in Bismarck, North Dakota.
- The existing site states that homeowner involvement is central to its home building process.
- Free consultation is offered on the original site.
- Address: 4521 Ottawa Street, Suite 200, Bismarck, ND 58503, United States.
- Email: <builders@huntingtonnd.com>.
- Telephone: +1 701 314 2346.
- Facebook: <https://www.facebook.com/HuntingtonBuilders>.
- Instagram: <https://www.instagram.com/huntington.builders/>.

The live site contains a heading for customer feedback but does not provide testimonial text in the fetched page or gallery configuration. No customer quotes, ratings, project counts, awards or claims of ranking were added.

## Lots and spec homes

The original section titled “Lots & Spec Homes Available” embeds the following existing map:

<https://www.google.com/maps/d/embed?mid=1II6unIVWoHVxY8v64Ezl2_JluJmNyAY&ehbc=2E312F&noprof=1>

The redesign links directly to the same published map using its Google My Maps viewer URL:

<https://www.google.com/maps/d/viewer?mid=1II6unIVWoHVxY8v64Ezl2_JluJmNyAY>

The original page does not expose individual lot or spec home addresses, prices, sales status or listing links in its HTML. The redesign does not assert any particular property is currently available. It asks visitors to confirm availability directly. The residential photograph alongside this section is completed-project photography, explicitly identified as inspiration rather than available inventory.

## Locally hosted photographs

Original asset prefix:

`https://img1.wsimg.com/isteam/ip/597963fe-ac0d-48ec-968d-803199a8d517/`

The hero and approach photographs came from the original homepage. The 15 project photos came from its complete gallery configuration in:

<https://img1.wsimg.com/blobby/go/597963fe-ac0d-48ec-968d-803199a8d517/gpub/8852ac1619bb7f88/script.js>

The photos are downloaded to `assets/` so the Cloudflare site does not depend on GoDaddy image hosting after migration. Downloads use the image service's resize parameters. All project photos are 1600 pixels wide; the hero is 2000 pixels wide. Filenames below identify originals, and the prefix above produces their source URLs.

| Local asset | Original asset filename | Subject |
| --- | --- | --- |
| `home-living.jpg` | `20-4406%20(20).jpg` | Living room, stone fireplace and timber beams |
| `home-kitchen.jpg` | `23-4406%20(23).jpg` | White kitchen cabinets and wood island |
| `project-01.jpg` | `Untitled%20design.png` | Completed house with its design rendering |
| `project-02.jpg` | `38-4406%20(38).jpg` | Kitchen sink, faucet and island |
| `project-03.jpg` | `11-4406%20(11).jpg` | Bedroom |
| `project-04.jpg` | `39-4406%20(39).jpg` | Timber ceiling and chandelier |
| `project-05.jpg` | `26-4406%20(26).jpg` | Open kitchen and living room |
| `project-06.jpg` | `5-4406%20(5).jpg` | Bathroom vanity |
| `project-07.jpg` | `37-4406%20(37).jpg` | Shower details |
| `project-08.jpg` | `3-1108%20(3).jpg` | Open unfurnished kitchen and living space |
| `project-09.jpg` | `DJI_0336.jpg` | Commercial plaza |
| `project-10.jpg` | `1-4521%20(1).jpg` | Office lounge and skylight |
| `project-11.jpg` | `DJI_0503-3b6ee32.jpg` | House exterior and driveway |
| `project-12.jpg` | `4-4521%20(4).jpg` | Conference room |
| `project-13.jpg` | `2-4521%20(2)-0735394.jpg` | Atrium Offices lobby |
| `project-14.jpg` | `_DSC0214-HDR.jpg` | Stone archway and dining room |
| `project-15.jpg` | `Rosberg-13.jpg` | Kitchen with stone countertops |
| `kitchen-stone.jpg` | `Rosberg-13.jpg` | Original 1800-pixel alternate, retained for later use |
| `original-logo.png` | `blob-0dbf0ed.png` | Original business logo, retained for later use |

Although the original collage source has a `.png` extension, the GoDaddy image service returned JPEG bytes when resized; the local file uses the correct `.jpg` extension.

## Contact and external services

The original GoDaddy form and attachment upload depended on GoDaddy services. This frontend uses direct email and telephone links. The consultation link explicitly opens the visitor's email app and does not claim that a message was submitted. No form backend, attachment upload, advertising cookies or analytics were added. Google Maps and social networks are accessed through clearly identified external links.

## Review before launch

Confirm current contact details and review the public map contents. Confirm that the downloaded existing photographs remain licensed for this business's website. Current availability should be maintained in the published map or with future verified listings. DNS and email records should be checked separately during migration; this repository does not change them.
