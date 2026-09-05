# Apex Bionet dynamic editing setup

## Public site

The public site remains compatible with GitHub Pages. Commit the contents of this directory to the repository root. The browser loads editable content from `data.json`, and each service/project has a standalone detail page.

## Detail pages

Services:

- `service-assay-development.html`
- `service-bioinformatics.html`
- `service-analytical-chemistry.html`
- `service-coordination-partnerships.html`

Projects:

- `project-veterinary-pathogen-intelligence.html`
- `project-vector-borne-disease-intelligence.html`
- `project-ai-powered-cancer-intelligence.html`

## Admin editing

The Admin button is intentionally disabled until a Worker URL is configured. Set this before deployment in `assets/js/site.js` or by adding a small script before it loads:

```html
<script>window.APEX_ADMIN_API_BASE = 'https://your-worker.your-subdomain.workers.dev';</script>
```

The editor allows an administrator to log in, edit the structured `data.json` content, and upload an image. Saving sends the JSON and image file to `worker.js`, which commits them to GitHub through the GitHub Contents API.

## Deploy the Worker

Deploy `worker.js` separately to Cloudflare Workers. Configure these secrets/variables:

- `ADMIN_PASSWORD` — admin password
- `SESSION_SECRET` — random signing secret
- `GITHUB_TOKEN` — GitHub token with repository contents write permission
- `GITHUB_OWNER` — GitHub username or organization
- `GITHUB_REPO` — repository name
- `GITHUB_BRANCH` — usually `main`
- `ALLOWED_ORIGIN` — exact GitHub Pages origin

Example commands:

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
wrangler secret put GITHUB_TOKEN
wrangler deploy
```

Use a fine-grained GitHub token limited to this repository with Contents: Read and write. Do not put the token in the website files.

## Editing options

For direct, lightweight maintenance, edit `data.json` and commit it to GitHub. For non-technical updates, use the Admin button after the Worker is deployed and configured.
