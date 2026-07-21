import { useMemo, useState } from "react";
import {
  products,
  type MonthlyReleaseEntry,
  type Priority,
  type Product,
  type ReleaseEntry,
} from "./types";

type RadarEntry = ReleaseEntry | MonthlyReleaseEntry;
type MarkerGroup = "attention" | "review" | "value";

const center = 200;
const priorityRadius: Record<Priority, number> = {
  critical: 58,
  high: 88,
  medium: 118,
  informational: 148,
};
const productLabels: Record<Product, string> = {
  Platform: "Platform",
  "Creator & Development": "Creator",
  ITSM: "ITSM",
  "CMDB & ITOM": "CMDB / ITOM",
  "Next Experience": "Next UX",
  SPM: "SPM",
};

function polarPoint(radius: number, angleDegrees: number) {
  const angle = angleDegrees * Math.PI / 180;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

function entryKind(entry: RadarEntry) {
  return "classification" in entry ? entry.classification : entry.changeType;
}

function markerGroup(kind: string): MarkerGroup {
  if (["risk", "deprecation", "removed"].includes(kind)) return "attention";
  if (["change", "changed", "patch"].includes(kind)) return "review";
  return "value";
}

function MarkerShape({ group, x, y }: { group: MarkerGroup; x: number; y: number }) {
  if (group === "attention") {
    return <polygon className="radar-shape" points={`${x},${y - 8} ${x - 7},${y + 6} ${x + 7},${y + 6}`} />;
  }
  if (group === "review") {
    return <rect className="radar-shape" x={x - 6.5} y={y - 6.5} width="13" height="13" rx="1.5" />;
  }
  return <circle className="radar-shape" cx={x} cy={y} r="6.5" />;
}

export function ImpactRadar({ entries }: { entries: RadarEntry[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const points = useMemo(() => {
    const groupSizes = new Map<string, number>();
    entries.forEach((entry) => {
      const key = `${entry.products[0]}-${entry.priority}`;
      groupSizes.set(key, (groupSizes.get(key) ?? 0) + 1);
    });

    const positions = new Map<string, number>();
    return entries.map((entry) => {
      const product = entry.products[0];
      const key = `${product}-${entry.priority}`;
      const position = positions.get(key) ?? 0;
      const size = groupSizes.get(key) ?? 1;
      positions.set(key, position + 1);
      const spread = Math.min(34, Math.max(0, (size - 1) * 8));
      const offset = size === 1 ? 0 : -spread / 2 + spread * position / (size - 1);
      const angle = -90 + products.indexOf(product) * 60 + offset;
      return {
        entry,
        kind: entryKind(entry),
        group: markerGroup(entryKind(entry)),
        ...polarPoint(priorityRadius[entry.priority], angle),
      };
    });
  }, [entries]);

  const activePoint = points.find(({ entry }) => entry.id === activeId);
  const productCount = new Set(entries.flatMap((entry) => entry.products)).size;

  return (
    <section className="impact-radar" aria-labelledby="impact-radar-title">
      <div className="impact-radar__visual">
        <svg className="impact-radar__chart" viewBox="0 0 400 400" role="img" aria-labelledby="impact-radar-svg-title impact-radar-svg-desc">
          <title id="impact-radar-svg-title">Impact radar for the current briefing</title>
          <desc id="impact-radar-svg-desc">Findings are grouped by product sector. Editorial priority determines distance from the center, with critical findings closest. Shape identifies attention items, review items, or value opportunities.</desc>
          {([58, 88, 118, 148] as const).map((radius) => <circle key={radius} className="radar-grid" cx={center} cy={center} r={radius} />)}
          {products.map((product, index) => {
            const lineEnd = polarPoint(148, -90 + index * 60);
            const label = polarPoint(174, -90 + index * 60);
            const anchor = label.x > 225 ? "start" : label.x < 175 ? "end" : "middle";
            return (
              <g key={product}>
                <line className="radar-spoke" x1={center} y1={center} x2={lineEnd.x} y2={lineEnd.y} />
                <text className="radar-product" x={label.x} y={label.y} textAnchor={anchor}>{productLabels[product]}</text>
              </g>
            );
          })}
          <circle className="radar-core" cx={center} cy={center} r="35" />
          <text className="radar-core__value" x={center} y="197" textAnchor="middle">{entries.length}</text>
          <text className="radar-core__label" x={center} y="214" textAnchor="middle">signals</text>
          {points.map(({ entry, group, kind, x, y }) => (
            <a
              key={entry.id}
              className={`radar-marker radar-marker--${group}`}
              href={`#entry-${entry.id}`}
              aria-label={`${entry.title}. ${entry.products[0]}. ${entry.priority} editorial priority. ${kind}.`}
              onMouseEnter={() => setActiveId(entry.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(entry.id)}
              onBlur={() => setActiveId(null)}
            >
              <title>{entry.title}</title>
              <MarkerShape group={group} x={x} y={y} />
            </a>
          ))}
        </svg>
        <ul className="sr-only">
          {entries.map((entry) => <li key={entry.id}>{entry.title}: {entry.products[0]}, {entry.priority} editorial priority, {entryKind(entry)}.</li>)}
        </ul>
      </div>

      <div className="impact-radar__copy">
        <p className="eyebrow">Visual overview</p>
        <h2 id="impact-radar-title">Impact radar</h2>
        <p>See where attention is concentrated across {productCount} {productCount === 1 ? "product" : "products"}. Critical items sit closest to the center.</p>
        <div className="radar-priority-scale" aria-label="Editorial priority rings">
          <strong>Critical</strong><span>High</span><span>Medium</span><span>Informational</span>
        </div>
        <div className="radar-legend" aria-label="Marker legend">
          <span><i className="legend-shape legend-shape--attention" aria-hidden="true" />Risk / deprecation / removed</span>
          <span><i className="legend-shape legend-shape--review" aria-hidden="true" />Change / patch</span>
          <span><i className="legend-shape legend-shape--value" aria-hidden="true" />Opportunity / new / fix</span>
        </div>
        <div className="radar-detail" aria-live="polite">
          {activePoint ? <><strong>{activePoint.entry.title}</strong><span>{activePoint.entry.products[0]} · {activePoint.entry.priority} · {activePoint.kind} · verified {activePoint.entry.source.verifiedAt}</span></> : <><strong>Explore a signal</strong><span>Hover or focus a marker; select it to open the corresponding briefing card.</span></>}
        </div>
        <p className="radar-disclaimer">Priorities shown here are editorial guidance, not official ServiceNow severity ratings.</p>
      </div>
    </section>
  );
}
