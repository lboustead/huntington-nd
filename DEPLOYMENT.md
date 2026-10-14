# Cloudflare Pages handoff

Target domain: **huntingtonnd.com**  
GitHub repository: **https://github.com/lboustead/huntington-nd**

## Connect the code

1. In Cloudflare Pages, connect the GitHub repository and choose branch `main`.
2. Select framework **None**, build command `npm run build`, output directory
   `dist`, and leave the root directory blank. Use Node 22.
3. Open the successful `pages.dev` deployment. Check mobile navigation, photos,
   contact actions, and linked third-party services before switching domains.
4. Add `huntingtonnd.com` and `www.huntingtonnd.com` under the Pages project's **Custom domains**
   settings and follow the DNS instructions Cloudflare gives for this project.
5. Confirm HTTPS and both hostnames resolve to the new site. If you want one
   hostname to redirect to the other, configure that domain redirect in
   Cloudflare; page-path redirects alone do not configure hostname redirects.

## Preserve existing domain services

Moving the registrar, moving DNS hosting, and changing the website are separate
operations. Export or record the current DNS zone before changing nameservers.
Preserve the MX records and TXT records used for email (including SPF, DKIM, and
DMARC), along with any service-verification and other subdomain records. Website
code does not recreate DNS records or mail service.

Domain transfers and DNS changes have not been performed as part of this code
work. Connect and review the Pages deployment first, then make the domain changes
when ready. Keep the old hosting available until you have checked the new site.

## Before the cutover

- Confirm the phone numbers, email addresses, and published service details.
- Verify the contact form, phone/SMS links and linked map pages.
- Run `npm ci` and `npm run build`; review the GitHub Actions build result.
- Confirm `/robots.txt`, `/sitemap.xml`, and a missing URL return appropriate
  content on Pages. A missing URL should return the custom 404 page.
- Read `CONTENT-SOURCES.md` for any business-specific details needing review.

## Contact Function

Follow [CONTACT-SETUP.md](CONTACT-SETUP.md) to configure Google Workspace SMTP in this Pages
project. Static pages deploy as before, with `functions/api/contact.js` compiled
from the repository root. Email delivery requires the SMTP app-password binding; redeploy after changing those settings.

## Updates and rollback

Once connected, pushing a commit to `main` triggers a Pages production build.
Use branches for preview deployments. To undo a code change, revert that commit
and push, or select an earlier successful production deployment in Cloudflare.
DNS and registrar changes require their own separate rollback decisions.

## Cloudflare documentation

- [Deploy static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Headers](https://developers.cloudflare.com/pages/configuration/headers/)
