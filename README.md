# Upgrade Brief

An unofficial, source-backed briefing tool with two views:

- **Family Upgrade Brief:** helps teams moving from Zurich to Australia find prioritized risks, changes, opportunities, and next actions.
- **Monthly Release Radar:** consolidates monthly ServiceNow Store application updates and platform patches into a role- and product-aware review.

Visitors can share filtered URLs, print or save a briefing as PDF, and open the exact official source behind every finding. The first monthly archive covers July 2026.

An interactive Impact Radar summarizes the filtered briefing by product, editorial priority, and signal type. Each marker links to its detailed card, and the same information remains available to assistive technology.

The interface follows the operating-system color preference by default. An accessible header control cycles between System, Light, and Dark modes and remembers explicit choices in local browser storage.

Upgrade Brief is an independent community project. It is not an official ServiceNow product and is not sponsored, approved, or endorsed by ServiceNow, Inc. Views, editorial priorities, and recommendations are the author's own and are explicitly separated from official ServiceNow facts.

## Source strategy

Use the official [ServiceNowDocs repository](https://github.com/ServiceNow/ServiceNowDocs) as the preferred machine-readable source for family documentation, family release notes, deprecations, and cross-family delta content. Read the branch matching the relevant family and retrieve only the Markdown files needed for the topic. Record the source path, commit SHA, `last_updated`, and canonical ServiceNow documentation URL when practical.

ServiceNowDocs is not the only source. Use a hybrid policy:

- **Family documentation and release deltas:** ServiceNowDocs Markdown first
- **Monthly Store application versions:** public ServiceNow Store release-note pages
- **Platform patches and availability:** public ServiceNow patches and hotfixes page
- **Restricted security or hotfix details:** Now Support; do not infer unavailable details
- **Images, diagrams, interactive content, and final human verification:** canonical ServiceNow documentation site

Use `llms.txt` as a directory rather than loading it or the entire repository into model context. Targeted Markdown retrieval and local text search reduce irrelevant context and make source comparisons more reproducible. Continue human verification before publishing any entry.

ServiceNowDocs retains only recent family branches, so dataset entries should preserve their verification date and source provenance. Do not mirror or republish the complete ServiceNow documentation corpus in this project.

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

Vite emits relative asset paths, so the same production build works at `https://phillipleroy.github.io/upgrade-brief/` and in local previews.

## Contribute

Use the GitHub issue templates to report a correction or propose either kind of release signal. Factual changes need a public official ServiceNow source. Community posts may help prioritize a topic but are not accepted as factual authority.

## License and trademarks

Code and original editorial content may be reused under the repository license once one is added. The project does not use ServiceNow logos or claim endorsement.

ServiceNow, the ServiceNow logo, Now, and other ServiceNow marks are trademarks and/or registered trademarks of ServiceNow, Inc., in the United States and/or other countries. Other company and product names may be trademarks of the respective companies with which they are associated.
