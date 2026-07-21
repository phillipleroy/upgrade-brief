import { useEffect, useMemo, useState } from "react";
import rawMonthlyEntries from "./data/monthlyReleaseEntries.json";
import rawUpgradeEntries from "./data/releaseEntries.json";
import {
  products,
  roles,
  type Focus,
  type MonthlyFocus,
  type MonthlyReleaseEntry,
  type Product,
  type ReleaseEntry,
  type Role,
  type ViewMode,
} from "./types";

const upgradeEntries = rawUpgradeEntries as ReleaseEntry[];
const monthlyEntries = rawMonthlyEntries as MonthlyReleaseEntry[];

const roleLabels: Record<Role, string> = {
  "platform-owner": "Platform owner",
  architect: "Architect",
  developer: "Developer",
  "product-manager": "Product manager",
};

const priorityRank = { critical: 0, high: 1, medium: 2, informational: 3 };
const classRank = { risk: 0, deprecation: 1, change: 2, opportunity: 3 };
const monthlyTypeRank = { removed: 0, changed: 1, patch: 2, new: 3, fixed: 4 };
const availableMonths = [...new Set(monthlyEntries.map((entry) => entry.month))].sort().reverse();

function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${month}-01T00:00:00Z`));
}

function readInitialState(): {
  view: ViewMode;
  selectedRole: Role | "";
  selectedProducts: Product[];
  upgradeFocus: Focus;
  monthlyFocus: MonthlyFocus;
  month: string;
} {
  const params = new URLSearchParams(window.location.search);
  const view: ViewMode = params.get("view") === "monthly" ? "monthly" : "upgrade";
  const roleValue = params.get("role");
  const selectedRole: Role | "" = roles.includes(roleValue as Role) ? (roleValue as Role) : "";
  const selectedProducts = (params.get("products") ?? "")
    .split(",")
    .filter((item): item is Product => products.includes(item as Product));
  const focusValue = params.get("focus");
  const upgradeFocus: Focus = ["risks", "opportunities"].includes(focusValue ?? "") ? focusValue as Focus : "all";
  const monthlyFocus: MonthlyFocus = ["actions", "new", "fixes"].includes(focusValue ?? "") ? focusValue as MonthlyFocus : "all";
  const requestedMonth = params.get("month") ?? "";
  const month = availableMonths.includes(requestedMonth) ? requestedMonth : availableMonths[0];
  return { view, selectedRole, selectedProducts, upgradeFocus, monthlyFocus, month };
}

function SourceDetails({ actions, title, url, verifiedAt }: { actions: string[]; title: string; url: string; verifiedAt: string }) {
  return (
    <>
      <details>
        <summary>Recommended actions</summary>
        <ul>{actions.map((action) => <li key={action}>{action}</li>)}</ul>
      </details>
      <a className="source-link" href={url} target="_blank" rel="noreferrer" aria-label={`Open official source: ${title}`}>
        Open official source <span aria-hidden="true">↗</span>
      </a>
      <p className="verified">Verified {verifiedAt}</p>
    </>
  );
}

function UpgradeCard({ entry }: { entry: ReleaseEntry }) {
  return (
    <article className={`entry-card entry-card--${entry.classification}`} data-testid={`entry-${entry.id}`}>
      <div className="entry-card__topline">
        <span className={`priority priority--${entry.priority}`}>{entry.priority}</span>
        <span className="classification">{entry.classification}</span>
        <span className="product-label">{entry.products[0]}</span>
      </div>
      <h3>{entry.title}</h3>
      <div className="fact-block"><span>Official fact</span><p>{entry.officialSummary}</p></div>
      <div className="editorial-block"><span>Our interpretation</span><p>{entry.editorialImplication}</p></div>
      <SourceDetails actions={entry.recommendedActions} {...entry.source} />
    </article>
  );
}

function MonthlyCard({ entry }: { entry: MonthlyReleaseEntry }) {
  const kindLabel = entry.releaseKind === "platform-patch" ? "Platform patch" : "Store app";
  return (
    <article className={`entry-card entry-card--monthly-${entry.changeType}`} data-testid={`entry-${entry.id}`}>
      <div className="entry-card__topline">
        <span className={`priority priority--${entry.priority}`}>{entry.priority}</span>
        <span className="classification">{entry.changeType}</span>
        <span className="product-label">{entry.products[0]}</span>
      </div>
      <p className="version-line"><span>{kindLabel}</span> · {entry.application} · {entry.releaseKind === "platform-patch" ? entry.version : `v${entry.version}`}</p>
      <h3>{entry.title}</h3>
      <div className="fact-block"><span>Official fact</span><p>{entry.officialSummary}</p></div>
      <div className="editorial-block"><span>Our interpretation</span><p>{entry.editorialImplication}</p></div>
      <p className="compatibility"><strong>Compatible family:</strong> {entry.familyCompatibility.join(", ")}</p>
      <SourceDetails actions={entry.recommendedActions} {...entry.source} />
    </article>
  );
}

function ResultSection<T extends { id: string }>({ id, eyebrow, title, description, items, renderCard }: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: T[];
  renderCard: (entry: T) => React.ReactNode;
}) {
  if (!items.length) return null;
  return (
    <section className="result-section" aria-labelledby={`${id}-title`}>
      <div className="section-heading">
        <div><p className="eyebrow">{eyebrow}</p><h2 id={`${id}-title`}>{title}</h2><p>{description}</p></div>
        <span className="count-badge">{items.length}</span>
      </div>
      <div className="entry-grid">{items.map(renderCard)}</div>
    </section>
  );
}

function ActionPlan({ items, title }: { items: Array<{ action: string; title: string }>; title: string }) {
  if (!items.length) return null;
  return (
    <section className="action-plan" aria-labelledby="action-title">
      <p className="eyebrow">Turn insight into work</p>
      <h2 id="action-title">{title}</h2>
      <ol>{items.map(({ action, title: sourceTitle }) => <li key={`${sourceTitle}-${action}`}><span>{action}</span><small>{sourceTitle}</small></li>)}</ol>
    </section>
  );
}

export default function App() {
  const initial = useMemo(readInitialState, []);
  const [view, setView] = useState<ViewMode>(initial.view);
  const [selectedRole, setSelectedRole] = useState<Role | "">(initial.selectedRole);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initial.selectedProducts);
  const [upgradeFocus, setUpgradeFocus] = useState<Focus>(initial.upgradeFocus);
  const [monthlyFocus, setMonthlyFocus] = useState<MonthlyFocus>(initial.monthlyFocus);
  const [month, setMonth] = useState(initial.month);
  const [copyLabel, setCopyLabel] = useState("Copy briefing link");

  const activeFocus = view === "upgrade" ? upgradeFocus : monthlyFocus;
  const isPersonalized = Boolean(selectedRole || selectedProducts.length || activeFocus !== "all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (view === "monthly") {
      params.set("view", "monthly");
      params.set("month", month);
    }
    if (selectedRole) params.set("role", selectedRole);
    if (selectedProducts.length) params.set("products", selectedProducts.join(","));
    if (activeFocus !== "all") params.set("focus", activeFocus);
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, [view, month, selectedRole, selectedProducts, activeFocus]);

  const filteredUpgradeEntries = useMemo(() => {
    const filtered = upgradeEntries.filter((entry) => {
      const roleMatches = !selectedRole || entry.roles.includes(selectedRole);
      const productMatches = !selectedProducts.length || entry.products.some((product) => selectedProducts.includes(product));
      const focusMatches = upgradeFocus === "all"
        || (upgradeFocus === "risks" && ["risk", "deprecation"].includes(entry.classification))
        || (upgradeFocus === "opportunities" && entry.classification === "opportunity");
      return roleMatches && productMatches && focusMatches;
    }).sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]
      || classRank[a.classification] - classRank[b.classification]
      || a.products[0].localeCompare(b.products[0]));
    return isPersonalized ? filtered : filtered.filter((entry) => ["critical", "high"].includes(entry.priority)).slice(0, 6);
  }, [selectedRole, selectedProducts, upgradeFocus, isPersonalized]);

  const filteredMonthlyEntries = useMemo(() => monthlyEntries.filter((entry) => {
    const roleMatches = !selectedRole || entry.roles.includes(selectedRole);
    const productMatches = !selectedProducts.length || entry.products.some((product) => selectedProducts.includes(product));
    const focusMatches = monthlyFocus === "all"
      || (monthlyFocus === "actions" && ["removed", "changed", "patch"].includes(entry.changeType))
      || (monthlyFocus === "new" && entry.changeType === "new")
      || (monthlyFocus === "fixes" && entry.changeType === "fixed");
    return entry.month === month && roleMatches && productMatches && focusMatches;
  }).sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]
    || monthlyTypeRank[a.changeType] - monthlyTypeRank[b.changeType]
    || a.application.localeCompare(b.application)), [month, selectedRole, selectedProducts, monthlyFocus]);

  const upgradeGroups = useMemo(() => ({
    risks: filteredUpgradeEntries.filter((entry) => ["risk", "deprecation"].includes(entry.classification)),
    changes: filteredUpgradeEntries.filter((entry) => entry.classification === "change"),
    opportunities: filteredUpgradeEntries.filter((entry) => entry.classification === "opportunity"),
  }), [filteredUpgradeEntries]);

  const monthlyGroups = useMemo(() => ({
    actions: filteredMonthlyEntries.filter((entry) => ["removed", "changed", "patch"].includes(entry.changeType)),
    newItems: filteredMonthlyEntries.filter((entry) => entry.changeType === "new"),
    fixes: filteredMonthlyEntries.filter((entry) => entry.changeType === "fixed"),
  }), [filteredMonthlyEntries]);

  const currentEntries = view === "upgrade" ? filteredUpgradeEntries : filteredMonthlyEntries;
  const actionItems = useMemo(() => {
    const seen = new Set<string>();
    return currentEntries.flatMap((entry) => entry.recommendedActions.map((action) => ({ action, title: entry.title })))
      .filter(({ action }) => !seen.has(action) && Boolean(seen.add(action)))
      .slice(0, 12);
  }, [currentEntries]);

  function toggleProduct(product: Product) {
    setSelectedProducts((current) => current.includes(product) ? current.filter((item) => item !== product) : [...current, product]);
  }

  function reset() {
    setSelectedRole("");
    setSelectedProducts([]);
    setUpgradeFocus("all");
    setMonthlyFocus("all");
    setMonth(availableMonths[0]);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLabel("Link copied");
    } catch {
      setCopyLabel("Copy the URL from your browser");
    }
    window.setTimeout(() => setCopyLabel("Copy briefing link"), 2200);
  }

  const isMonthly = view === "monthly";
  const focusOptions = isMonthly ? (["all", "actions", "new", "fixes"] as MonthlyFocus[]) : (["all", "risks", "opportunities"] as Focus[]);

  return (
    <>
      <a className="skip-link" href="#briefing-results">Skip to briefing</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Upgrade Brief home"><span className="brand-mark" aria-hidden="true">UB</span><span>Upgrade Brief</span></a>
        <nav aria-label="Primary navigation"><a href="#methodology">Methodology</a><a href="https://github.com/phillipleroy/upgrade-brief" target="_blank" rel="noreferrer">GitHub</a></nav>
      </header>

      <main id="top">
        <section className={`hero ${isMonthly ? "hero--monthly" : ""}`}>
          <div className="hero__copy">
            <div className="view-switcher" aria-label="Briefing type">
              <button className={!isMonthly ? "active" : ""} onClick={() => setView("upgrade")} aria-pressed={!isMonthly}>Family upgrade</button>
              <button className={isMonthly ? "active" : ""} onClick={() => setView("monthly")} aria-pressed={isMonthly}>Monthly radar <span>New</span></button>
            </div>
            <p className="kicker">{isMonthly ? `${monthLabel(month)} · Store apps + platform patches` : <>Zurich <span>→</span> Australia · 2026 edition</>}</p>
            <h1>{isMonthly ? "See what changed across your ServiceNow products this month." : "Build your Australia upgrade briefing in five minutes."}</h1>
            <p className="hero__lede">{isMonthly ? "Turn fragmented application version histories and patch notes into one focused, role-aware release radar." : "Skip the release-note maze. Get a focused view of the risks, decisions, and opportunities that matter to your role and product footprint."}</p>
            <div className="trust-row" aria-label="Project principles">
              <span>{isMonthly ? `${monthlyEntries.filter((entry) => entry.month === month).length} monthly signals` : "30 curated signals"}</span><span>Official sources</span><span>No sign-in</span>
            </div>
            <p className="independence-note">A personal project by a ServiceNow® employee. Independent, unofficial, and not sponsored, approved, or endorsed by ServiceNow, Inc.</p>
          </div>
          <aside className="hero__note"><p className="eyebrow">The promise</p><p>{isMonthly ? "ServiceNow publishes by application. The radar brings the month together and tells your team what deserves attention." : "ServiceNow Docs tells you what changed. This briefing helps your team decide what to inspect, test, adopt, or retire."}</p></aside>
        </section>

        <div className="workspace">
          <aside className="builder" aria-labelledby="builder-title">
            <div className="builder__intro"><p className="step-number">01</p><div><p className="eyebrow">Shape your view</p><h2 id="builder-title">{isMonthly ? "Radar builder" : "Briefing builder"}</h2></div></div>
            {isMonthly && (
              <fieldset><legend>Release month</legend><label className="select-label" htmlFor="release-month">Archive month</label><select id="release-month" value={month} onChange={(event) => setMonth(event.target.value)}>{availableMonths.map((item) => <option key={item} value={item}>{monthLabel(item)}</option>)}</select></fieldset>
            )}
            <fieldset><legend>Your role</legend><div className="role-grid">{roles.map((role) => <button key={role} className={selectedRole === role ? "choice active" : "choice"} onClick={() => setSelectedRole(selectedRole === role ? "" : role)} aria-pressed={selectedRole === role}>{roleLabels[role]}</button>)}</div></fieldset>
            <fieldset><legend>Products in scope</legend><div className="product-grid">{products.map((product) => <label key={product} className={selectedProducts.includes(product) ? "check-row active" : "check-row"}><input type="checkbox" checked={selectedProducts.includes(product)} onChange={() => toggleProduct(product)} /><span>{product}</span><span className="check-mark" aria-hidden="true">✓</span></label>)}</div></fieldset>
            <fieldset><legend>Focus</legend><div className={`focus-control ${isMonthly ? "focus-control--four" : ""}`}>{focusOptions.map((item) => <button key={item} onClick={() => isMonthly ? setMonthlyFocus(item as MonthlyFocus) : setUpgradeFocus(item as Focus)} className={activeFocus === item ? "active" : ""} aria-pressed={activeFocus === item}>{item}</button>)}</div></fieldset>
            <div className="builder__actions"><button className="primary-button" onClick={copyLink}>{copyLabel}</button><button className="text-button" onClick={() => window.print()}>Print / save PDF</button><button className="text-button" onClick={reset}>Reset</button></div>
            <p className="privacy-note">Your choices stay in the URL. No account, cookies, or tracking.</p>
          </aside>

          <section id="briefing-results" className="results" aria-live="polite">
            <div className="results__header">
              <div><p className="eyebrow">{isMonthly ? `${monthLabel(month)} radar` : isPersonalized ? "Your briefing" : "Sample briefing"}</p><h2>{isMonthly ? `${filteredMonthlyEntries.length} monthly ${filteredMonthlyEntries.length === 1 ? "signal" : "signals"} for your context` : isPersonalized ? `${filteredUpgradeEntries.length} signals for your upgrade` : "Start with the signals most teams should see"}</h2><p>{isMonthly ? "Monthly priorities are editorial guidance. Store apps may have separate family, subscription, and dependency requirements." : isPersonalized ? "Priorities are editorial guidance, not official ServiceNow severity ratings." : "Choose a role or product to replace this preview with a focused briefing."}</p></div>
              {isMonthly ? <div className="release-stamp release-stamp--month"><span>RADAR</span><strong>{monthLabel(month).split(" ")[0]}</strong><i>{month.slice(0, 4)}</i><span>SOURCES</span><strong>Store + patch</strong></div> : <div className="release-stamp"><span>FROM</span><strong>Zurich</strong><i>→</i><span>TO</span><strong>Australia</strong></div>}
            </div>

            {currentEntries.length ? isMonthly ? (
              <>
                <ResultSection id="monthly-actions" eyebrow="Decide and prepare" title="Action required" description="Removed components, behavior changes, and platform maintenance that may need an owner." items={monthlyGroups.actions} renderCard={(entry) => <MonthlyCard key={entry.id} entry={entry} />} />
                <ResultSection id="monthly-new" eyebrow="Evaluate the value" title="New capabilities" description="Features worth testing where they align with a real operational or product outcome." items={monthlyGroups.newItems} renderCard={(entry) => <MonthlyCard key={entry.id} entry={entry} />} />
                <ResultSection id="monthly-fixes" eyebrow="Improve platform health" title="Fixes and maintenance" description="Defect corrections that may resolve known pain or justify an application update." items={monthlyGroups.fixes} renderCard={(entry) => <MonthlyCard key={entry.id} entry={entry} />} />
                <ActionPlan items={actionItems} title="Monthly review checklist" />
              </>
            ) : (
              <>
                <ResultSection id="risks" eyebrow="Protect the upgrade" title="Critical risks & deprecations" description="Removed, unsupported, or strategically retired capabilities that deserve an owner." items={upgradeGroups.risks} renderCard={(entry) => <UpgradeCard key={entry.id} entry={entry} />} />
                <ResultSection id="changes" eyebrow="Review the behavior" title="Changes requiring review" description="Access, defaults, or workflows that can behave differently after the upgrade." items={upgradeGroups.changes} renderCard={(entry) => <UpgradeCard key={entry.id} entry={entry} />} />
                <ResultSection id="opportunities" eyebrow="Use the release" title="Opportunities worth evaluating" description="Capabilities with a credible path to reduced effort, stronger control, or better experience." items={upgradeGroups.opportunities} renderCard={(entry) => <UpgradeCard key={entry.id} entry={entry} />} />
                <ActionPlan items={actionItems} title="Role-specific action checklist" />
              </>
            ) : <div className="empty-state"><p className="eyebrow">No matching signals</p><h3>Broaden your selection</h3><p>Try “All” focus or add another product area.</p><button className="primary-button" onClick={reset}>Reset briefing</button></div>}
          </section>
        </div>

        <section id="methodology" className="methodology">
          <div className="methodology__intro"><p className="eyebrow">How to trust this</p><h2>Official facts. Clearly labeled judgment.</h2><p>Upgrade signals come from family release notes. Monthly signals come from public ServiceNow Store application version histories and patch availability pages. Every item links to its source and records when it was checked.</p></div>
          <div className="method-grid"><article><span>01</span><h3>Select</h3><p>We prioritize migration work, behavior changes, regression fixes, and capabilities with a practical adoption decision.</p></article><article><span>02</span><h3>Verify</h3><p>Facts are checked against public ServiceNow documentation. Security details requiring Now Support access are never reconstructed.</p></article><article><span>03</span><h3>Interpret</h3><p>Implications and actions are separate editorial guidance—not ServiceNow severity, compatibility approval, or advice.</p></article><article><span>04</span><h3>Correct</h3><p>Corrections and proposed entries are welcome through the public GitHub issue templates.</p></article></div>
          <div className="update-note"><strong>Last content review</strong><span>21 July 2026</span><span>July 2026 monthly archive included</span><span>Australia Patch 4 coverage included</span></div>
        </section>
      </main>

      <footer><div className="footer__line"><p><strong>Upgrade Brief</strong> · A personal project created independently by a ServiceNow employee.</p><p>Not an official ServiceNow product and not sponsored, approved, or endorsed by ServiceNow, Inc. Views, priorities, and recommendations are the author’s own.</p></div><div className="ai-note"><span>AI transparency</span><p>This project was created with AI assistance. Release information was summarized and structured from the linked official ServiceNow sources, then reviewed for accuracy as of 21 July 2026. AI-generated content can contain errors or become outdated. Confirm all findings in current ServiceNow documentation and validate recommendations in your own non-production instance before making upgrade decisions. Priorities and actions shown here are editorial guidance, not official ServiceNow severity ratings.</p></div><div className="trademark-note"><span>Trademarks</span><p>ServiceNow, the ServiceNow logo, Now, and other ServiceNow marks are trademarks and/or registered trademarks of ServiceNow, Inc., in the United States and/or other countries. Other company and product names may be trademarks of the respective companies with which they are associated.</p></div></footer>
    </>
  );
}
