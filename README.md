# Apex Bionet dynamic multipage website

This is a static, data-driven Apex Bionet website designed for GitHub Pages. It keeps the original visual design system while adding individual detail pages for every service and project.

## Public pages

- `index.html` — Home
- `focus.html` — Focus / One Health
- `services.html` — Services overview
- `projects.html` — Projects overview
- `contact.html` — Contact

## Individual detail pages

Services:

- `service-assay-development.html`
- `service-bioinformatics.html`
- `service-analytical-chemistry.html`
- `service-coordination-partnerships.html`

Projects:

- `project-veterinary-pathogen-intelligence.html`
- `project-vector-borne-disease-intelligence.html`
- `project-ai-powered-cancer-intelligence.html`

The Services and Projects overview cards link directly to these pages through the **Learn more** and **View project details** buttons.

## Data-driven editing

The public pages load their copy, service records, project records, image paths, and contact information from `data.json`. This means text and structured content can be updated without editing the HTML page templates.

For simple maintenance, edit `data.json`, commit the change to GitHub, and let GitHub Pages redeploy the site.

## Browser-based interactive admin editing

The site includes an **Admin** button and a structured editor modeled on the interactive workflow in the referenced Nirvana Biotech repository. After login, the editor supports:

- Editing site, home, focus, contact, service, and project fields through labeled controls
- Adding and removing services and projects
- Editing service tags as a comma-separated list
- Uploading replacement images for service and project records
- Keeping pending changes in the browser while moving between pages
- Downloading `data.json` as a manual fallback
- Saving the updated JSON and image files to GitHub through a Cloudflare Worker

The Admin button is intentionally inactive until a Worker URL is configured. Add the Worker URL to `assets/js/site.js` or inject it before that script loads:

```html
<script>
  window.APEX_ADMIN_API_BASE = 'https://your-worker.your-subdomain.workers.dev';
</script>
```

The Worker must be deployed separately. It should never be placed on GitHub Pages because it contains the server-side GitHub token logic.

## Worker configuration

The included `worker.js` provides `/login`, `/verify`, and `/save` routes. Configure these values in Cloudflare Workers:

- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `ALLOWED_ORIGIN`

Use a fine-grained GitHub token restricted to this repository with Contents: Read and write permission. Do not place the token in browser code.

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for deployment details.

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Shared files

- `assets/css/site.css` — shared design system, responsive layout, detail page styles, and admin panel styles
- `assets/js/site.js` — data loading, page rendering, detail routing, navigation, contact form, and admin editor
- `assets/images/` — extracted source imagery
- `data.json` — editable content model
- `worker.js` — optional Cloudflare Worker for authenticated GitHub saves
- `wrangler.toml` — Worker configuration template
- `SETUP_GUIDE.md` — setup and deployment instructions
