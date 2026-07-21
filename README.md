# ServiceNow Upgrade Briefing Generator

An unofficial, source-backed briefing tool for teams moving from Zurich to the ServiceNow Australia release. Visitors select a role and product footprint to see prioritized risks, changes, opportunities, and a practical action checklist.

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

## Edit the release dataset

Release signals live in `src/data/releaseEntries.json`. Every entry requires:

- A stable kebab-case ID
- The Zurich-to-Australia release path
- Supported product and role values
- Classification and editorial priority
- A concise official fact and separately labeled interpretation
- At least one recommended action
- A public official ServiceNow source and verification date

Run `npm run validate:data` after editing. The validator rejects duplicate IDs, unsupported values, non-ServiceNow source URLs, invalid dates, and incomplete coverage.

## Publish with GitHub Pages

The workflow in `.github/workflows/deploy.yml` tests, builds, and deploys the `dist` directory when `main` changes. In the repository settings, select **GitHub Actions** as the Pages source.

Vite emits relative asset paths, so the same production build works at `https://phillipleroy.github.io/servicenow-upgrade-briefing/` and in local previews.

## Contribute

Use the GitHub issue templates to report a correction or propose a release signal. Factual changes need a public official ServiceNow source. Community posts may help prioritize a topic but are not accepted as factual authority.

## License and trademarks

Code and original editorial content may be reused under the repository license once one is added. ServiceNow is a trademark of ServiceNow, Inc. This independent community project does not use the ServiceNow logo or claim endorsement.
