# ServiceNow Upgrade Briefing and Monthly Release Radar

An unofficial, source-backed briefing tool with two views:

- **Family Upgrade Brief:** helps teams moving from Zurich to Australia find prioritized risks, changes, opportunities, and next actions.
- **Monthly Release Radar:** consolidates monthly ServiceNow Store application updates and platform patches into a role- and product-aware review.

Visitors can share filtered URLs, print or save a briefing as PDF, and open the exact official source behind every finding. The first monthly archive covers July 2026.

The project is not affiliated with or endorsed by ServiceNow. Editorial priorities and recommendations are explicitly separated from official ServiceNow facts.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
```

## Edit the datasets

Family-upgrade signals live in `src/data/releaseEntries.json`. Every entry requires:

- A stable kebab-case ID
- The Zurich-to-Australia release path
- Supported product and role values
- Classification and editorial priority
- A concise official fact and separately labeled interpretation
- At least one recommended action
- A public official ServiceNow source and verification date

Monthly signals live in `src/data/monthlyReleaseEntries.json`. They additionally require:

- A `YYYY-MM` archive month
- A release kind: `store-application` or `platform-patch`
- Application and version identifiers
- A monthly change type: `new`, `changed`, `fixed`, `removed`, or `patch`
- Explicit family compatibility taken from the official notes

Monthly Store entries come from public ServiceNow application version histories. Platform patch entries come from the public available-patches-and-hotfixes page. Some security and hotfix details require Now Support access; do not infer or reproduce details that are not publicly documented.

Run `npm run validate:data` after editing. The validator checks both datasets and rejects duplicate IDs, unsupported values, non-ServiceNow source URLs, invalid dates, missing actions, and incomplete product coverage.

## Add a new monthly archive

1. Review the official ServiceNow Store release-note directory and the relevant application version histories.
2. Review the official family patch and hotfix availability page.
3. Add only changes that create a practical review, adoption, regression, or maintenance decision.
4. Keep the official summary factual and separate from the editorial implication.
5. Record compatibility exactly as documented and verify every URL.
6. Run `npm test`, review every role/product/focus combination, and update the methodology review date.

The app derives its month selector from the dataset, so adding entries with a new `month` value automatically creates a new archive option.

## Publish with GitHub Pages

The workflow in `.github/workflows/deploy.yml` tests, builds, and deploys the `dist` directory when `main` changes. In the repository settings, select **GitHub Actions** as the Pages source.

Vite emits relative asset paths, so the same production build works at `https://phillipleroy.github.io/servicenow-upgrade-briefing/` and in local previews.

## Contribute

Use the GitHub issue templates to report a correction or propose either kind of release signal. Factual changes need a public official ServiceNow source. Community posts may help prioritize a topic but are not accepted as factual authority.

## License and trademarks

Code and original editorial content may be reused under the repository license once one is added. ServiceNow is a trademark of ServiceNow, Inc. This independent community project does not use the ServiceNow logo or claim endorsement.
