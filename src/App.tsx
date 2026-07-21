import { useEffect, useMemo, useState } from "react";
import rawEntries from "./data/releaseEntries.json";
import {
  products,
  roles,
  type Classification,
  type Focus,
  type Product,
  type ReleaseEntry,
  type Role,
} from "./types";

const entries = rawEntries as ReleaseEntry[];

const roleLabels: Record<Role, string> = {
  "platform-owner": "Platform owner",
  architect: "Architect",
  developer: "Developer",
  "product-manager": "Product manager",
};

const priorityRank = { critical: 0, high: 1, medium: 2, informational: 3 };
const classRank = { risk: 0, deprecation: 1, change: 2, opportunity: 3 };

function readInitialState(): { selectedRole: Role | ""; selectedProducts: Product[]; focus: Focus } {
  const params = new URLSearchParams(window.location.search);
  const roleValue = params.get("role");
  const selectedRole: Role | "" = roles.includes(roleValue as Role) ? (roleValue as Role) : "";
  const selectedProducts = (params.get("products") ?? "")
    .split(",")
    .filter((item): item is Product => products.includes(item as Product));
  const focusValue = params.get("focus");
  const focus: Focus = ["risks", "opportunities"].includes(focusValue ?? "")
    ? (focusValue as Focus)
    : "all";
  return { selectedRole, selectedProducts, focus };
}

function EntryCard({ entry }: { entry: ReleaseEntry }) {
  return (
    <article className={`entry-card entry-card--${entry.classification}`} data-testid={`entry-${entry.id}`}>
      <div className="entry-card__topline">
        <span className={`priority priority--${entry.priority}`}>{entry.priority}</span>
        <span className="classification">{entry.classification}</span>
        <span className="product-label">{entry.products[0]}</span>
      </div>
      <h3>{entry.title}</h3>
      <div className="fact-block">
        <span>Official fact</span>
        <p>{entry.officialSummary}</p>
      </div>
      <div className="editorial-block">
        <span>Our interpretation</span>
        <p>{entry.editorialImplication}</p>
      </div>
      <details>
        <summary>Recommended actions</summary>
        <ul>
          {entry.recommendedActions.map((action) => <li key={action}>{action}</li>)}
        </ul>
      </details>
      <a className="source-link" href={entry.source.url} target="_blank" rel="noreferrer">
        Open official source <span aria-hidden="true">↗</span>
      </a>
      <p className="verified">Verified {entry.source.verifiedAt}</p>
    </article>
  );
}

function ResultSection({
  id,
  eyebrow,
  title,
  description,
  items,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: ReleaseEntry[];
}) {
  if (!items.length) return null;
  return (
    <section className="result-section" aria-labelledby={`${id}-title`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
        <span className="count-badge">{items.length}</span>
      </div>
      <div className="entry-grid">{items.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</div>
    </section>
  );
}

export default function App() {
  const initial = useMemo(readInitialState, []);
  const [selectedRole, setSelectedRole] = useState<Role | "">(initial.selectedRole);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initial.selectedProducts);
  const [focus, setFocus] = useState<Focus>(initial.focus);
  const [copyLabel, setCopyLabel] = useState("Copy briefing link");

  const isPersonalized = Boolean(selectedRole || selectedProducts.length);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedRole) params.set("role", selectedRole);
    if (selectedProducts.length) params.set("products", selectedProducts.join(","));
    if (focus !== "all") params.set("focus", focus);
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, [selectedRole, selectedProducts, focus]);

  const filteredEntries = useMemo(() => {
    const source = entries.filter((entry) => {
      const roleMatches = !selectedRole || entry.roles.includes(selectedRole);
      const productMatches = !selectedProducts.length || entry.products.some((product) => selectedProducts.includes(product));
      const focusMatches = focus === "all"
        || (focus === "risks" && ["risk", "deprecation"].includes(entry.classification))
        || (focus === "opportunities" && entry.classification === "opportunity");
      return roleMatches && productMatches && focusMatches;
    });
    const sorted = [...source].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]
      || classRank[a.classification] - classRank[b.classification]
      || a.products[0].localeCompare(b.products[0]));
    return isPersonalized ? sorted : sorted.filter((entry) => ["critical", "high"].includes(entry.priority)).slice(0, 6);
  }, [selectedRole, selectedProducts, focus, isPersonalized]);

  const grouped = useMemo(() => ({
    risks: filteredEntries.filter((entry) => ["risk", "deprecation"].includes(entry.classification)),
    changes: filteredEntries.filter((entry) => entry.classification === "change"),
    opportunities: filteredEntries.filter((entry) => entry.classification === "opportunity"),
  }), [filteredEntries]);

  const actionItems = useMemo(() => {
    const seen = new Set<string>();
    return filteredEntries.flatMap((entry) => entry.recommendedActions.map((action) => ({ action, title: entry.title })))
      .filter(({ action }) => !seen.has(action) && Boolean(seen.add(action)))
      .slice(0, 12);
  }, [filteredEntries]);

  function toggleProduct(product: Product) {
    setSelectedProducts((current) => current.includes(product)
      ? current.filter((item) => item !== product)
      : [...current, product]);
  }

  function reset() {
    setSelectedRole("");
    setSelectedProducts([]);
    setFocus("all");
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

  return (
    <>
      <a className="skip-link" href="#briefing-results">Skip to briefing</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Upgrade Brief home">
          <span className="brand-mark" aria-hidden="true">UB</span>
          <span>Upgrade Brief</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#methodology">Methodology</a>
          <a href="https://github.com/phillipleroy/servicenow-upgrade-briefing" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__copy">
            <p className="kicker">Zurich <span>→</span> Australia · 2026 edition</p>
            <h1>Build your Australia upgrade briefing in five minutes.</h1>
            <p className="hero__lede">Skip the release-note maze. Get a focused view of the risks, decisions, and opportunities that matter to your role and product footprint.</p>
            <div className="trust-row" aria-label="Project principles">
              <span>30 curated signals</span><span>Official sources</span><span>No sign-in</span>
            </div>
          </div>
          <aside className="hero__note">
            <p className="eyebrow">The promise</p>
            <p>ServiceNow Docs tells you what changed. This briefing helps your team decide what to inspect, test, adopt, or retire.</p>
          </aside>
        </section>

        <div className="workspace">
          <aside className="builder" aria-labelledby="builder-title">
            <div className="builder__intro">
              <p className="step-number">01</p>
              <div><p className="eyebrow">Shape your view</p><h2 id="builder-title">Briefing builder</h2></div>
            </div>

            <fieldset>
              <legend>Your role</legend>
              <div className="role-grid">
                {roles.map((role) => (
                  <button key={role} className={selectedRole === role ? "choice active" : "choice"} onClick={() => setSelectedRole(selectedRole === role ? "" : role)} aria-pressed={selectedRole === role}>
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Products in scope</legend>
              <div className="product-grid">
                {products.map((product) => (
                  <label key={product} className={selectedProducts.includes(product) ? "check-row active" : "check-row"}>
                    <input type="checkbox" checked={selectedProducts.includes(product)} onChange={() => toggleProduct(product)} />
                    <span>{product}</span><span className="check-mark" aria-hidden="true">✓</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Focus</legend>
              <div className="focus-control">
                {(["all", "risks", "opportunities"] as Focus[]).map((item) => (
                  <button key={item} onClick={() => setFocus(item)} className={focus === item ? "active" : ""} aria-pressed={focus === item}>{item}</button>
                ))}
              </div>
            </fieldset>

            <div className="builder__actions">
              <button className="primary-button" onClick={copyLink}>{copyLabel}</button>
              <button className="text-button" onClick={() => window.print()}>Print / save PDF</button>
              <button className="text-button" onClick={reset}>Reset</button>
            </div>
            <p className="privacy-note">Your choices stay in the URL. No account, cookies, or tracking.</p>
          </aside>

          <section id="briefing-results" className="results" aria-live="polite">
            <div className="results__header">
              <div>
                <p className="eyebrow">{isPersonalized ? "Your briefing" : "Sample briefing"}</p>
                <h2>{isPersonalized ? `${filteredEntries.length} signals for your upgrade` : "Start with the signals most teams should see"}</h2>
                <p>{isPersonalized ? "Priorities are editorial guidance, not official ServiceNow severity ratings." : "Choose a role or product to replace this preview with a focused briefing."}</p>
              </div>
              <div className="release-stamp"><span>FROM</span><strong>Zurich</strong><i>→</i><span>TO</span><strong>Australia</strong></div>
            </div>

            {filteredEntries.length ? (
              <>
                <ResultSection id="risks" eyebrow="Protect the upgrade" title="Critical risks & deprecations" description="Removed, unsupported, or strategically retired capabilities that deserve an owner." items={grouped.risks} />
                <ResultSection id="changes" eyebrow="Review the behavior" title="Changes requiring review" description="Access, defaults, or workflows that can behave differently after the upgrade." items={grouped.changes} />
                <ResultSection id="opportunities" eyebrow="Use the release" title="Opportunities worth evaluating" description="Capabilities with a credible path to reduced effort, stronger control, or better experience." items={grouped.opportunities} />
                {actionItems.length > 0 && (
                  <section className="action-plan" aria-labelledby="action-title">
                    <p className="eyebrow">Turn insight into work</p>
                    <h2 id="action-title">Role-specific action checklist</h2>
                    <ol>{actionItems.map(({ action, title }) => <li key={`${title}-${action}`}><span>{action}</span><small>{title}</small></li>)}</ol>
                  </section>
                )}
              </>
            ) : (
              <div className="empty-state"><p className="eyebrow">No matching signals</p><h3>Broaden your selection</h3><p>Try “All” focus or add another product area.</p><button className="primary-button" onClick={reset}>Reset briefing</button></div>
            )}
          </section>
        </div>

        <section id="methodology" className="methodology">
          <div className="methodology__intro">
            <p className="eyebrow">How to trust this</p>
            <h2>Official facts. Clearly labeled judgment.</h2>
            <p>Every signal links to ServiceNow documentation and records when it was checked. Our priority and recommended actions are editorial guidance—not ServiceNow severity or advice.</p>
          </div>
          <div className="method-grid">
            <article><span>01</span><h3>Select</h3><p>We focus on changes that create migration work, access changes, regression risk, or a practical adoption decision.</p></article>
            <article><span>02</span><h3>Verify</h3><p>Facts come from public ServiceNow Australia release summaries and are rechecked when the dataset changes.</p></article>
            <article><span>03</span><h3>Interpret</h3><p>Implications and actions are written separately so you can distinguish documentation from editorial judgment.</p></article>
            <article><span>04</span><h3>Correct</h3><p>Corrections and proposed entries are welcome through the public GitHub issue templates.</p></article>
          </div>
          <div className="update-note"><strong>Last content review</strong><span>21 July 2026</span><span>Australia Patch 4 coverage included</span></div>
        </section>
      </main>

      <footer>
        <p><strong>Upgrade Brief</strong> · An unofficial community project.</p>
        <p>Not affiliated with or endorsed by ServiceNow. ServiceNow is a trademark of ServiceNow, Inc.</p>
      </footer>
    </>
  );
}
