import { useState, useEffect, useRef } from "react";

// --- Data & Helpers ---
const DRIVERS = [
  { id: 1, name: "Jake Thornton II", car: "#42", irating: 2847, sr: "A 3.21", laps: 0, position: 1, gap: 0, trend: "stable" },
  { id: 2, name: "Marco Bianchi", car: "#17", irating: 2631, sr: "A 2.98", laps: 0, position: 2, gap: 1.2, trend: "up" },
  { id: 3, name: "Sarah Chen", car: "#8", irating: 2504, sr: "B 4.12", laps: 0, position: 3, gap: 2.8, trend: "up" },
  { id: 4, name: "Thomas Herrera", car: "#33", irating: 1987, sr: "B 2.44", laps: 0, position: 4, gap: 4.1, trend: "down" },
  { id: 5, name: "Dylan Park", car: "#61", irating: 2215, sr: "B 3.67", laps: 0, position: 5, gap: 5.3, trend: "stable" },
  { id: 6, name: "Riley Johnson", car: "#5", irating: 2102, sr: "B 3.01", laps: 0, position: 6, gap: 7.0, trend: "down" },
  { id: 7, name: "Alex Nowak", car: "#29", irating: 1876, sr: "C 4.55", laps: 0, position: 7, gap: 9.2, trend: "up" },
  { id: 8, name: "Kim Nguyen", car: "#14", irating: 2340, sr: "A 1.88", laps: 0, position: 8, gap: 11.4, trend: "stable" },
];

const SERIES = [
  { id: "rookie-street", name: "Rookie Street Stock", track: "Charlotte Motor Speedway", laps: 30, split: "Top Split", sof: 2188, status: "live", viewers: 847 },
  { id: "rookie-mazda", name: "Rookie Mazda MX-5", track: "Laguna Seca", laps: 12, split: "Split 2", sof: 1654, status: "live", viewers: 423 },
  { id: "gt3-sprint", name: "GT3 Sprint Series", track: "Spa-Francorchamps", laps: 20, split: "Top Split", sof: 3421, status: "starting", viewers: 1205 },
  { id: "nascar-a", name: "NASCAR Class A Fixed", track: "Daytona Intl.", laps: 40, split: "Top Split", sof: 4102, status: "upcoming", viewers: 0 },
];

const ACTIVITY_FEED = [
  { user: "SpeedDemon99", action: "bought YES", driver: "Jake Thornton II", amount: 50, time: "12s ago" },
  { user: "RookieKing", action: "bought NO", driver: "Jake Thornton II", amount: 25, time: "28s ago" },
  { user: "SimBetter", action: "bought YES", driver: "Marco Bianchi", amount: 100, time: "45s ago" },
  { user: "OvalMaster", action: "bought YES", driver: "Sarah Chen", amount: 15, time: "1m ago" },
  { user: "BrakeLate42", action: "sold YES", driver: "Thomas Herrera", amount: 30, time: "1m ago" },
  { user: "TurnLeft", action: "bought NO", driver: "Riley Johnson", amount: 75, time: "2m ago" },
];

function generateOdds(position, totalDrivers) {
  const base = Math.max(0.03, 1 - (position - 1) * 0.12 - Math.random() * 0.08);
  return Math.min(0.97, Math.max(0.03, base));
}

function formatCurrency(n) { return "$" + n.toFixed(2); }
function formatPct(n) { return (n * 100).toFixed(1) + "%"; }

// --- Components ---

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 800, color: "#fff"
      }}>P</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>PitPredict</div>
        <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase" }}>Sim Racing Markets</div>
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  const colors = { live: "#22c55e", starting: "#eab308", upcoming: "#64748b" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, textTransform: "uppercase",
      color: colors[status] || "#64748b"
    }}>
      {status === "live" && (
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#22c55e", display: "inline-block",
          animation: "pulse 1.5s infinite"
        }} />
      )}
      {status}
    </span>
  );
}

function Wallet({ balance, positions }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
      borderRadius: 10, padding: "8px 16px"
    }}>
      <div>
        <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Balance</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#6366f1" }}>{formatCurrency(balance)}</div>
      </div>
      <div style={{ width: 1, height: 30, background: "rgba(99,102,241,0.25)" }} />
      <div>
        <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Positions</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{positions}</div>
      </div>
    </div>
  );
}

function RaceCard({ race, onClick, isSelected }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? "rgba(99,102,241,0.15)" : "rgba(30,41,59,0.6)",
        border: isSelected ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(51,65,85,0.5)",
        borderRadius: 12, padding: 16, cursor: "pointer",
        transition: "all 0.2s", minWidth: 220,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <StatusDot status={race.status} />
        {race.status === "live" && (
          <span style={{ fontSize: 11, color: "#94a3b8" }}>{race.viewers.toLocaleString()} watching</span>
        )}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{race.name}</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>{race.track}</div>
      <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: "#64748b" }}>
        <span>SOF: {race.sof}</span>
        <span>{race.split}</span>
        <span>{race.laps} laps</span>
      </div>
    </div>
  );
}

function OddsButton({ label, odds, color, onClick, small }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color === "green" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
        border: `1px solid ${color === "green" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        borderRadius: 8, padding: small ? "6px 10px" : "8px 14px",
        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
        minWidth: small ? 60 : 72, transition: "all 0.15s"
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <span style={{ fontSize: small ? 10 : 11, color: "#94a3b8", marginBottom: 2 }}>{label}</span>
      <span style={{
        fontSize: small ? 14 : 16, fontWeight: 700,
        color: color === "green" ? "#22c55e" : "#ef4444"
      }}>{odds}</span>
    </button>
  );
}

function DriverRow({ driver, odds, onBet, compact }) {
  const trendIcon = driver.trend === "up" ? "▲" : driver.trend === "down" ? "▼" : "●";
  const trendColor = driver.trend === "up" ? "#22c55e" : driver.trend === "down" ? "#ef4444" : "#64748b";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: compact ? "10px 14px" : "14px 18px",
      borderBottom: "1px solid rgba(51,65,85,0.3)",
      transition: "background 0.15s"
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(51,65,85,0.2)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={{
          width: compact ? 28 : 32, height: compact ? 28 : 32, borderRadius: 8,
          background: driver.position <= 3 ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(51,65,85,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: compact ? 12 : 14, fontWeight: 700, color: "#fff"
        }}>
          P{driver.position}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: "#e2e8f0" }}>{driver.name}</span>
            <span style={{ fontSize: 10, color: trendColor }}>{trendIcon}</span>
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {driver.car} · iR {driver.irating} · SR {driver.sr}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {driver.gap > 0 && (
          <span style={{ fontSize: 11, color: "#64748b", marginRight: 8 }}>+{driver.gap.toFixed(1)}s</span>
        )}
        <OddsButton label="Yes" odds={formatPct(odds)} color="green" small={compact}
          onClick={() => onBet(driver, "yes", odds)} />
        <OddsButton label="No" odds={formatPct(1 - odds)} color="red" small={compact}
          onClick={() => onBet(driver, "no", 1 - odds)} />
      </div>
    </div>
  );
}

function BetSlip({ bet, onConfirm, onCancel, onAmountChange }) {
  if (!bet) return null;
  const payout = bet.amount / bet.price;
  const profit = payout - bet.amount;

  return (
    <div style={{
      background: "rgba(30,41,59,0.95)", border: "1px solid rgba(99,102,241,0.4)",
      borderRadius: 14, padding: 20, backdropFilter: "blur(10px)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>Place Prediction</span>
        <button onClick={onCancel} style={{
          background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18
        }}>×</button>
      </div>

      <div style={{
        background: "rgba(15,23,42,0.6)", borderRadius: 10, padding: 14, marginBottom: 14
      }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
          {bet.side === "yes" ? "YES — Will Win" : "NO — Won't Win"}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>{bet.driver.name}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
          Current odds: {formatPct(bet.price)} · P{bet.driver.position}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Amount ($)</label>
        <div style={{ display: "flex", gap: 6 }}>
          {[5, 10, 25, 50, 100].map(v => (
            <button key={v} onClick={() => onAmountChange(v)} style={{
              flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid",
              borderColor: bet.amount === v ? "rgba(99,102,241,0.6)" : "rgba(51,65,85,0.5)",
              background: bet.amount === v ? "rgba(99,102,241,0.2)" : "rgba(15,23,42,0.4)",
              color: bet.amount === v ? "#a5b4fc" : "#94a3b8",
              cursor: "pointer", fontSize: 13, fontWeight: 600
            }}>${v}</button>
          ))}
        </div>
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", padding: "10px 0",
        borderTop: "1px solid rgba(51,65,85,0.3)", fontSize: 13
      }}>
        <span style={{ color: "#94a3b8" }}>Potential Payout</span>
        <span style={{ color: "#22c55e", fontWeight: 700 }}>{formatCurrency(payout)}</span>
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", padding: "6px 0 14px",
        fontSize: 13
      }}>
        <span style={{ color: "#94a3b8" }}>Potential Profit</span>
        <span style={{ color: "#22c55e", fontWeight: 700 }}>+{formatCurrency(profit)}</span>
      </div>

      <button onClick={onConfirm} style={{
        width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
        transition: "opacity 0.15s"
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Confirm — {formatCurrency(bet.amount)}
      </button>
    </div>
  );
}

function ActivityFeed({ items }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
        Live Activity
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 0", borderBottom: "1px solid rgba(51,65,85,0.2)",
          fontSize: 12
        }}>
          <div>
            <span style={{ color: "#a5b4fc", fontWeight: 600 }}>{item.user}</span>
            <span style={{ color: item.action.includes("YES") ? "#22c55e" : "#ef4444", margin: "0 4px" }}>
              {item.action}
            </span>
            <span style={{ color: "#94a3b8" }}>{item.driver}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>${item.amount}</span>
            <span style={{ color: "#475569", fontSize: 10 }}>{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniChart({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200, h = 50;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="2" />
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill="url(#chartGrad)"
      />
    </svg>
  );
}

function PositionsPanel({ positions, onClose }) {
  if (positions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 13 }}>No open positions yet</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>Place a prediction to get started</div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
        Your Positions
      </div>
      {positions.map((p, i) => (
        <div key={i} style={{
          background: "rgba(15,23,42,0.4)", borderRadius: 10, padding: 12, marginBottom: 8,
          border: "1px solid rgba(51,65,85,0.3)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.driver}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
              background: p.side === "yes" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: p.side === "yes" ? "#22c55e" : "#ef4444"
            }}>{p.side.toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
            <span>Cost: {formatCurrency(p.cost)}</span>
            <span>Payout: <span style={{ color: "#22c55e" }}>{formatCurrency(p.payout)}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: "🏁", title: "Pick a Race", desc: "Browse live iRacing races across all series and splits" },
    { icon: "📈", title: "Make a Prediction", desc: "Buy YES or NO shares on any driver. Contracts pay $1.00 if correct." },
    { icon: "⚡", title: "Trade Live", desc: "Odds update in real-time. Buy low, sell high — or hold to settlement." },
    { icon: "💰", title: "Cash Out", desc: "Winning contracts pay $1.00. Withdraw your earnings anytime." },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
      margin: "20px 0"
    }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          background: "rgba(30,41,59,0.5)", borderRadius: 12, padding: 18,
          border: "1px solid rgba(51,65,85,0.3)", textAlign: "center"
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{s.title}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  );
}

function RaceSimulation({ lap, totalLaps }) {
  const pct = Math.min(100, (lap / totalLaps) * 100);
  return (
    <div style={{
      background: "rgba(15,23,42,0.6)", borderRadius: 12, padding: 16,
      border: "1px solid rgba(51,65,85,0.3)", marginBottom: 16
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusDot status="live" />
          <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>Lap {lap} / {totalLaps}</span>
        </div>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {lap >= totalLaps ? "CHECKERED FLAG" : lap >= totalLaps - 2 ? "FINAL LAPS" : "GREEN FLAG"}
        </span>
      </div>
      <div style={{
        height: 6, background: "rgba(51,65,85,0.4)", borderRadius: 3, overflow: "hidden"
      }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          borderRadius: 3, transition: "width 0.5s"
        }} />
      </div>
    </div>
  );
}

// --- Main App ---
export default function PitPredict() {
  const [selectedRace, setSelectedRace] = useState(SERIES[0]);
  const [drivers, setDrivers] = useState(DRIVERS);
  const [odds, setOdds] = useState({});
  const [balance, setBalance] = useState(500);
  const [positions, setPositions] = useState([]);
  const [activeBet, setActiveBet] = useState(null);
  const [betAmount, setBetAmount] = useState(25);
  const [lap, setLap] = useState(18);
  const [tab, setTab] = useState("market");
  const [toast, setToast] = useState(null);
  const [chartData] = useState(() =>
    DRIVERS.reduce((acc, d) => {
      acc[d.id] = Array.from({ length: 20 }, (_, i) => {
        const base = generateOdds(d.position, DRIVERS.length);
        return base + (Math.random() - 0.5) * 0.1;
      });
      return acc;
    }, {})
  );

  // Initialize and update odds
  useEffect(() => {
    const newOdds = {};
    drivers.forEach(d => {
      newOdds[d.id] = generateOdds(d.position, drivers.length);
    });
    setOdds(newOdds);
  }, [drivers]);

  // Simulate race
  useEffect(() => {
    const interval = setInterval(() => {
      setLap(prev => {
        if (prev >= selectedRace.laps) return prev;
        return prev + 1;
      });
      setDrivers(prev => prev.map(d => ({
        ...d,
        gap: d.position === 1 ? 0 : Math.max(0.1, d.gap + (Math.random() - 0.52) * 0.8),
        trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? "up" : "down") : d.trend
      })).sort((a, b) => a.gap - b.gap).map((d, i) => ({ ...d, position: i + 1 })));
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedRace]);

  function handleBet(driver, side, price) {
    setActiveBet({ driver, side, price, amount: betAmount });
  }

  function confirmBet() {
    if (!activeBet || activeBet.amount > balance) {
      setToast("Insufficient balance");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    const payout = activeBet.amount / activeBet.price;
    setBalance(prev => prev - activeBet.amount);
    setPositions(prev => [...prev, {
      driver: activeBet.driver.name,
      side: activeBet.side,
      cost: activeBet.amount,
      payout: payout,
      price: activeBet.price
    }]);
    setToast(`Position opened: ${activeBet.side.toUpperCase()} on ${activeBet.driver.name}`);
    setTimeout(() => setToast(null), 3000);
    setActiveBet(null);
  }

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      minHeight: "100vh", color: "#e2e8f0"
    }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 100,
          background: "rgba(99,102,241,0.95)", color: "#fff",
          padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          animation: "slideIn 0.3s ease-out", boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 24px", borderBottom: "1px solid rgba(51,65,85,0.4)",
        background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {["market", "positions", "how"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "6px 14px", borderRadius: 8, border: "none",
                background: tab === t ? "rgba(99,102,241,0.2)" : "transparent",
                color: tab === t ? "#a5b4fc" : "#64748b",
                cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize"
              }}>{t === "how" ? "How It Works" : t}</button>
            ))}
          </div>
          <Wallet balance={balance} positions={positions.length} />
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>

        {tab === "how" && <HowItWorks />}

        {/* Race selector */}
        <div style={{
          display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16,
          marginBottom: 20
        }}>
          {SERIES.map(race => (
            <RaceCard
              key={race.id} race={race}
              isSelected={selectedRace.id === race.id}
              onClick={() => { setSelectedRace(race); setLap(race.status === "live" ? 18 : 0); }}
            />
          ))}
        </div>

        {tab === "positions" ? (
          <div style={{ maxWidth: 600 }}>
            <PositionsPanel positions={positions} />
          </div>
        ) : tab === "market" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
            {/* Main market */}
            <div>
              <RaceSimulation lap={lap} totalLaps={selectedRace.laps} />

              <div style={{
                background: "rgba(30,41,59,0.5)", borderRadius: 14,
                border: "1px solid rgba(51,65,85,0.3)", overflow: "hidden"
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 18px", borderBottom: "1px solid rgba(51,65,85,0.3)"
                }}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>
                      Who will win?
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>
                      {selectedRace.name} · {selectedRace.track}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    ${(Math.random() * 5000 + 2000).toFixed(0)} volume
                  </span>
                </div>

                {drivers.map(d => (
                  <DriverRow
                    key={d.id} driver={d}
                    odds={odds[d.id] || 0.5}
                    onBet={handleBet}
                  />
                ))}
              </div>

              {/* Odds chart for leader */}
              <div style={{
                background: "rgba(30,41,59,0.5)", borderRadius: 14,
                border: "1px solid rgba(51,65,85,0.3)", padding: 16, marginTop: 16
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>
                  Price History — {drivers[0]?.name || "Leader"}
                </div>
                <MiniChart data={chartData[drivers[0]?.id] || []} />
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Bet slip */}
              <BetSlip
                bet={activeBet}
                onConfirm={confirmBet}
                onCancel={() => setActiveBet(null)}
                onAmountChange={(amt) => setActiveBet(prev => prev ? { ...prev, amount: amt } : null)}
              />

              {/* Activity */}
              <div style={{
                background: "rgba(30,41,59,0.5)", borderRadius: 14,
                border: "1px solid rgba(51,65,85,0.3)", padding: 16
              }}>
                <ActivityFeed items={ACTIVITY_FEED} />
              </div>

              {/* Mini positions */}
              <div style={{
                background: "rgba(30,41,59,0.5)", borderRadius: 14,
                border: "1px solid rgba(51,65,85,0.3)", padding: 16
              }}>
                <PositionsPanel positions={positions} />
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div style={{
          marginTop: 40, padding: "20px 0", borderTop: "1px solid rgba(51,65,85,0.3)",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ fontSize: 11, color: "#475569" }}>
            PitPredict — Sim Racing Prediction Markets · Prototype v0.1
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>
            Not a real product. For demonstration purposes only.
          </div>
        </div>
      </div>
    </div>
  );
}