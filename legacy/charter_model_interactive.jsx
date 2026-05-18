import { useState, useMemo } from "react";

const fmt = (n) => {
  if (Math.abs(n) >= 1000) return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(0);
};

const pct = (n) => (n * 100).toFixed(1) + "%";

function Slider({ label, value, onChange, min, max, step, format, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "var(--accent)", height: 6, cursor: "pointer" }}
      />
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontStyle: "italic" }}>{sub}</div>}
    </div>
  );
}

function Metric({ label, value, sub, highlight }) {
  const isNeg = typeof value === "number" && value < 0;
  const color = highlight ? (isNeg ? "var(--red)" : "var(--green)") : "var(--text-primary)";
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 2, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: highlight ? 22 : 17, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
        {typeof value === "number" ? fmt(value) : value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function HeatCell({ value, best, worst }) {
  const range = best - worst;
  const ratio = range === 0 ? 0.5 : Math.max(0, Math.min(1, (value - worst) / range));
  const r = Math.round(220 - ratio * 180);
  const g = Math.round(60 + ratio * 160);
  const b = Math.round(60);
  const bg = `rgba(${r},${g},${b},0.15)`;
  const color = `rgb(${r},${g},${b})`;
  return (
    <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, background: bg, color, borderBottom: "1px solid var(--border)" }}>
      {fmt(value)}
    </td>
  );
}

export default function CharterModel() {
  const [purchase, setPurchase] = useState(307700);
  const [relocCost, setRelocCost] = useState(30000);
  const [refitCost, setRefitCost] = useState(17000);
  const [dpPct, setDpPct] = useState(0.25);
  const [rate, setRate] = useState(0.09);
  const [term, setTerm] = useState(15);
  const [availWeeks, setAvailWeeks] = useState(42);
  const [weeklyRate, setWeeklyRate] = useState(4800);
  const [occupancy, setOccupancy] = useState(0.65);
  const [ownerSplit, setOwnerSplit] = useState(0.75);
  const [insurPct, setInsurPct] = useState(0.025);
  const [maintPct, setMaintPct] = useState(0.03);
  const [fixedExp, setFixedExp] = useState(13000);
  const [depreciation, setDepreciation] = useState(0.05);

  const totalAcq = purchase + relocCost + refitCost + purchase * 0.015 + 5000;
  const dp = totalAcq * dpPct;
  const loan = totalAcq - dp;
  const monthlyRate = rate / 12;
  const nPayments = term * 12;
  const monthlyPmt = loan > 0 ? loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -nPayments)) : 0;
  const annualDebt = monthlyPmt * 12;

  const booked = availWeeks * occupancy;
  const gross = booked * weeklyRate;
  const ownerRev = gross * ownerSplit;
  const insurance = totalAcq * insurPct;
  const maintenance = totalAcq * maintPct;
  const provTurn = booked * 110;
  const totalExp = insurance + maintenance + fixedExp + provTurn;
  const noi = ownerRev - totalExp;
  const cashFlow = noi - annualDebt;
  const monthlyCF = cashFlow / 12;
  const roi = dp > 0 ? (cashFlow / dp) * 100 : 0;

  // 10-year projection
  const projection = useMemo(() => {
    let cumCF = 0;
    return Array.from({ length: 10 }, (_, i) => {
      const yr = i + 1;
      const noiYr = noi * Math.pow(1.015, i);
      const cfYr = noiYr - annualDebt;
      cumCF += cfYr;
      const boatVal = totalAcq * Math.pow(1 - depreciation, yr);
      const nPaid = yr * 12;
      const remain = nPaid >= nPayments ? 0 : loan * (Math.pow(1 + monthlyRate, nPayments) - Math.pow(1 + monthlyRate, nPaid)) / (Math.pow(1 + monthlyRate, nPayments) - 1);
      const equity = boatVal - remain;
      return { yr, noiYr, cfYr, cumCF, boatVal, remain, equity };
    });
  }, [noi, annualDebt, totalAcq, depreciation, loan, monthlyRate, nPayments]);

  // Heatmap: occupancy vs weekly rate
  const occRange = [0.40, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80];
  const rateRange = [3500, 4000, 4500, 5000, 5500, 6000, 6500];
  const heatData = useMemo(() => {
    let allVals = [];
    const grid = occRange.map((occ) =>
      rateRange.map((wr) => {
        const b = availWeeks * occ;
        const g = b * wr;
        const or2 = g * ownerSplit;
        const exp = totalAcq * insurPct + totalAcq * maintPct + fixedExp + b * 110;
        const n = or2 - exp;
        const cf = (n - annualDebt) / 12;
        allVals.push(cf);
        return cf;
      })
    );
    return { grid, min: Math.min(...allVals), max: Math.max(...allVals) };
  }, [availWeeks, ownerSplit, totalAcq, insurPct, maintPct, fixedExp, annualDebt]);

  const breakEvenOcc = useMemo(() => {
    for (let o = 0.01; o <= 1; o += 0.01) {
      const b = availWeeks * o;
      const g = b * weeklyRate;
      const or2 = g * ownerSplit;
      const exp = totalAcq * insurPct + totalAcq * maintPct + fixedExp + b * 110;
      if (or2 - exp - annualDebt >= 0) return o;
    }
    return null;
  }, [availWeeks, weeklyRate, ownerSplit, totalAcq, insurPct, maintPct, fixedExp, annualDebt]);

  return (
    <div style={{
      "--bg": "#0a0f1a", "--surface": "#111827", "--surface2": "#1a2235", "--border": "#1e293b",
      "--text-primary": "#e2e8f0", "--text-secondary": "#94a3b8", "--text-muted": "#64748b",
      "--accent": "#38bdf8", "--green": "#4ade80", "--red": "#f87171", "--amber": "#fbbf24",
      background: "var(--bg)", color: "var(--text-primary)", fontFamily: "'Inter', -apple-system, sans-serif",
      minHeight: "100vh", padding: "20px 16px"
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.03em", color: "var(--accent)" }}>
            CHARTER CAT PROJECTIONS
          </h1>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            2019 Leopard 40 — Multivariate Financial Model
          </div>
        </div>

        {/* INPUTS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Acquisition & Financing</div>
            <Slider label="Purchase Price" value={purchase} onChange={setPurchase} min={200000} max={500000} step={5000} format={fmt} />
            <Slider label="Relocation + Refit" value={relocCost + refitCost} onChange={(v) => { setRelocCost(v * 0.6); setRefitCost(v * 0.4); }} min={0} max={80000} step={1000} format={fmt} sub="Transport + cosmetics + survey" />
            <Slider label="Down Payment" value={dpPct} onChange={setDpPct} min={0.10} max={0.80} step={0.05} format={pct} />
            <Slider label="Interest Rate" value={rate} onChange={setRate} min={0.06} max={0.12} step={0.0025} format={pct} />
            <Slider label="Loan Term (years)" value={term} onChange={setTerm} min={5} max={20} step={1} format={(v) => v + " yr"} />
          </div>

          <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Revenue & Operations</div>
            <Slider label="Charter Weeks Avail" value={availWeeks} onChange={setAvailWeeks} min={30} max={48} step={1} format={(v) => v + " wks"} sub={`Personal use: ${52 - availWeeks} weeks`} />
            <Slider label="Avg Weekly Rate" value={weeklyRate} onChange={setWeeklyRate} min={3000} max={12000} step={100} format={fmt} sub="Blended high/low season" />
            <Slider label="Occupancy Rate" value={occupancy} onChange={setOccupancy} min={0.30} max={0.90} step={0.01} format={pct} />
            <Slider label="Owner Rev Split" value={ownerSplit} onChange={setOwnerSplit} min={0.60} max={0.85} step={0.01} format={pct} sub="You keep this %, fleet keeps rest" />
            <Slider label="Annual Depreciation" value={depreciation} onChange={setDepreciation} min={0.02} max={0.08} step={0.005} format={pct} />
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Costs</div>
            <Metric label="TOTAL ALL-IN COST" value={totalAcq} sub={`Purchase ${fmt(purchase)} + ${fmt(relocCost + refitCost)} reloc/refit`} />
            <Metric label="DOWN PAYMENT" value={dp} sub={pct(dpPct) + " of " + fmt(totalAcq)} />
            <Metric label="LOAN AMOUNT" value={loan} />
            <Metric label="MONTHLY PAYMENT" value={monthlyPmt} sub={term + "yr @ " + pct(rate)} />
          </div>

          <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Revenue</div>
            <Metric label="WEEKS BOOKED" value={booked.toFixed(1) + " wks"} />
            <Metric label="GROSS CHARTER REV" value={gross} />
            <Metric label="YOUR " value={ownerRev} sub={pct(ownerSplit) + " of gross"} />
            <Metric label="TOTAL EXPENSES" value={-totalExp} sub={`Ins ${fmt(insurance)} + Maint ${fmt(maintenance)} + Fixed ${fmt(fixedExp)}`} />
          </div>

          <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Bottom Line</div>
            <Metric label="NET OPERATING INCOME" value={noi} />
            <Metric label="ANNUAL DEBT SERVICE" value={-annualDebt} />
            <Metric label="ANNUAL CASH FLOW" value={cashFlow} highlight />
            <Metric label="MONTHLY CASH FLOW" value={monthlyCF} highlight />
            <Metric label="CASH-ON-CASH ROI" value={roi.toFixed(1) + "%"} />
            {breakEvenOcc && <Metric label="BREAKEVEN OCCUPANCY" value={pct(breakEvenOcc)} sub="Min occupancy to stay positive" />}
          </div>
        </div>

        {/* HEATMAP */}
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border)", marginBottom: 24, overflowX: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Monthly Cash Flow — Occupancy × Weekly Rate
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 6px", textAlign: "left", color: "var(--text-muted)", fontSize: 11, borderBottom: "2px solid var(--border)" }}>Occ ↓ / Rate →</th>
                {rateRange.map((r) => (
                  <th key={r} style={{ padding: "8px 6px", textAlign: "right", color: "var(--text-muted)", fontSize: 11, borderBottom: "2px solid var(--border)", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(r)}/wk</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {occRange.map((occ, i) => (
                <tr key={occ}>
                  <td style={{ padding: "8px 6px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>{pct(occ)}</td>
                  {heatData.grid[i].map((val, j) => (
                    <HeatCell key={j} value={val} best={heatData.max} worst={heatData.min} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
            <span style={{ color: "var(--red)" }}>■</span> Negative &nbsp;&nbsp; <span style={{ color: "var(--green)" }}>■</span> Positive &nbsp;&nbsp; Values show monthly cash flow after all expenses + debt service
          </div>
        </div>

        {/* 10-YEAR PROJECTION */}
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border)", overflowX: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            10-Year Projection
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Year", "NOI", "Cash Flow", "Cumulative CF", "Boat Value", "Loan Bal", "Equity", "Total Return"].map((h) => (
                  <th key={h} style={{ padding: "8px 6px", textAlign: h === "Year" ? "left" : "right", color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid var(--border)", fontFamily: "'JetBrains Mono', monospace" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projection.map((p) => (
                <tr key={p.yr} style={{ background: p.yr % 2 === 0 ? "var(--surface2)" : "transparent" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid var(--border)" }}>{p.yr}</td>
                  {[p.noiYr, p.cfYr, p.cumCF, p.boatVal, p.remain, p.equity, p.equity + p.cumCF].map((v, i) => (
                    <td key={i} style={{
                      padding: "8px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: i === 6 ? 700 : 400,
                      color: [1, 2, 6].includes(i) ? (v >= 0 ? "var(--green)" : "var(--red)") : "var(--text-secondary)",
                      borderBottom: "1px solid var(--border)"
                    }}>{fmt(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16, padding: "12px 0", borderTop: "2px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Initial Investment</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}>{fmt(dp)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>10yr Total Return</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "var(--green)" }}>
                {fmt((projection[9]?.equity || 0) + (projection[9]?.cumCF || 0))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Net Gain vs Invested</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: (projection[9]?.equity || 0) + (projection[9]?.cumCF || 0) - dp >= 0 ? "var(--green)" : "var(--red)" }}>
                {fmt((projection[9]?.equity || 0) + (projection[9]?.cumCF || 0) - dp)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: "var(--surface2)", borderRadius: 8, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--amber)" }}>⚠ Assumptions:</strong> Import duty 1.5% + $5K legal/survey baked into all-in cost. Expenses grow ~1.5%/yr. No tax benefits modeled. Heatmap uses your current financing + expense settings. Depreciation applies to total acquisition cost. This is a projection tool, not financial advice.
        </div>
      </div>
    </div>
  );
}
