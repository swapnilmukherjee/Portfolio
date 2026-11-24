import type { ReactNode } from "react";
import type { Project } from "@/data/content-types";

/**
 * Small code-drawn explainers, one per project, on a 320 x 220 grid with a 16px
 * margin. Rules: connectors start and end on a box edge, no line crosses a label,
 * labels fit inside their boxes (IBM Plex Mono at 11px is about 6.6px a glyph).
 * Structure uses --line-strong; the main flow uses the accent (class "pd-draw")
 * and draws in when an ancestor has data-active="true", arrowheads fade in after.
 */

const S = "var(--line-strong)";
const ACC = "var(--pd-acc)";

const css = `
.pd-svg{display:block;width:100%;height:auto;overflow:visible}
.pd-svg text{font-family:var(--font-code);font-size:11px;fill:var(--text-2)}
.pd-svg .pd-dim{fill:var(--muted)}
.pd-svg .pd-on{fill:var(--text)}
[data-active="false"] .pd-draw{stroke-dasharray:1;stroke-dashoffset:1}
[data-active="true"] .pd-draw{stroke-dasharray:1;stroke-dashoffset:0;animation:pd-draw 800ms var(--ease-out) both}
[data-active="true"] .pd-head{animation:pd-fade 240ms var(--ease-out) 560ms both}
@keyframes pd-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes pd-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){[data-active] .pd-draw{animation:none;stroke-dasharray:none;stroke-dashoffset:0}[data-active] .pd-head{animation:none}}
`;

export function projectAccent(p: Project): string {
  if (p.tags.some((t) => /auth0|iam|oauth/i.test(t))) return "var(--c3)";
  if (p.category === "Cybersecurity") return "var(--c1)";
  return "var(--c2)";
}

const LINE = { stroke: S, strokeWidth: 1.5, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Box({ x, y, w, h, label, accent, dim, r = 6 }: { x: number; y: number; w: number; h: number; label?: string; accent?: boolean; dim?: boolean; r?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill="var(--raised)" stroke={accent ? ACC : S} strokeWidth={1.5} />
      {label && (
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" className={dim ? "pd-dim" : accent ? "pd-on" : undefined}>
          {label}
        </text>
      )}
    </g>
  );
}

function Txt({ x, y, children, anchor = "middle", dim }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; dim?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={dim ? "pd-dim" : undefined}>
      {children}
    </text>
  );
}

/** Arrowhead with its tip at (x, y), pointing along angle a (radians). */
function Head({ x, y, a, accent }: { x: number; y: number; a: number; accent?: boolean }) {
  const h = 6;
  const p1 = [x - h * Math.cos(a - 0.5), y - h * Math.sin(a - 0.5)];
  const p2 = [x - h * Math.cos(a + 0.5), y - h * Math.sin(a + 0.5)];
  return (
    <path
      className={accent ? "pd-head" : undefined}
      d={`M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${x} ${y} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`}
      fill="none"
      stroke={accent ? ACC : S}
      strokeWidth={accent ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

const R = 0;
const D = Math.PI / 2;
const U = -Math.PI / 2;

/** Straight grey connector with a head at the end. */
function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} {...LINE} />
      <Head x={x2} y={y2} a={Math.atan2(y2 - y1, x2 - x1)} />
    </g>
  );
}

/** The accent path that draws in, plus the heads that land on its targets. */
function Flow({ d, heads = [] }: { d: string; heads?: { x: number; y: number; a: number }[] }) {
  return (
    <g>
      <path className="pd-draw" d={d} pathLength={1} fill="none" stroke={ACC} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
      {heads.map((h, i) => (
        <Head key={i} {...h} accent />
      ))}
    </g>
  );
}

type Spec = { label: string; body: ReactNode };

function build(p: Project): Spec {
  switch (p.id) {
    case "project-movzuup5": {
      const roles = ["Tenant Admin", "Analyst", "Billing", "Viewer"];
      return {
        label: "Four roles send requests through a scope check. Allowed requests reach the API, others get a 403.",
        body: (
          <>
            {roles.map((r, i) => (
              <g key={r}>
                <Box x={16} y={22 + i * 44} w={96} h={32} label={r} />
                {i > 0 && <Arrow x1={112} y1={38 + i * 44} x2={144} y2={38 + i * 44} />}
              </g>
            ))}
            <rect x={146} y={18} width={30} height={168} rx={8} fill="var(--raised)" stroke={S} strokeWidth={1.5} />
            <Txt x={161} y={206} dim>scope check</Txt>
            <Arrow x1={176} y1={136} x2={214} y2={136} />
            <Box x={216} y={118} w={88} h={36} label="403 deny" dim />
            <Box x={216} y={50} w={88} h={36} label="API 200" accent />
            <Flow d="M112 38 H161 V68 H214" heads={[{ x: 214, y: 68, a: R }]} />
          </>
        ),
      };
    }
    case "tripshare":
      return {
        label: "Two trips with overlapping routes meet at a match point and continue as one shared ride",
        body: (
          <>
            <circle cx={28} cy={56} r={5} fill="var(--raised)" stroke={S} strokeWidth={1.5} />
            <circle cx={28} cy={164} r={5} fill="var(--raised)" stroke={S} strokeWidth={1.5} />
            <Txt x={16} y={40} anchor="start" dim>trip A</Txt>
            <Txt x={16} y={188} anchor="start" dim>trip B</Txt>
            <path d="M33 56 C96 56 104 110 149 110" {...LINE} />
            <path d="M33 164 C96 164 104 110 149 110" {...LINE} />
            <Flow d="M163 110 H289" />
            <circle cx={156} cy={110} r={7} fill="var(--raised)" stroke={ACC} strokeWidth={2} />
            <circle cx={296} cy={110} r={6} fill={ACC} />
            <Txt x={156} y={90}>match</Txt>
            <Txt x={226} y={132}>shared ride</Txt>
            <Txt x={296} y={90} anchor="end" dim>destination</Txt>
          </>
        ),
      };
    case "fast-fuzzer":
      return {
        label: "Spec, binary and tests seed a mutate and run loop; new coverage feeds back and exposes blind spots",
        body: (
          <>
            {["spec", "binary", "tests"].map((l, i) => (
              <Box key={l} x={16} y={38 + i * 40} w={72} h={28} label={l} />
            ))}
            <path d="M88 52 H102 V132 H88" {...LINE} />
            <Arrow x1={102} y1={92} x2={118} y2={92} />
            <Box x={120} y={76} w={72} h={32} label="mutate" />
            <Box x={228} y={76} w={76} h={32} label="run" accent />
            <path d="M266 108 V136 H156 V112" {...LINE} />
            <Head x={156} y={110} a={U} />
            <Txt x={211} y={154} dim>feedback</Txt>
            {[12, 18, 14, 28, 22].map((h, i) => (
              <rect key={i} x={231 + i * 15} y={66 - h} width={10} height={h} rx={2} fill="var(--raised)" stroke={i === 3 ? ACC : S} strokeWidth={1.5} />
            ))}
            <Txt x={266} y={28} dim>coverage</Txt>
            <Flow d="M192 92 H226" heads={[{ x: 226, y: 92, a: R }]} />
            <Txt x={160} y={200} dim>finds spec vs code blind spots</Txt>
          </>
        ),
      };
    case "pizzeria":
      return {
        label: "Dine-in, pickup and delivery orders go through a Java service into orders, items and stock tables",
        body: (
          <>
            {["dine-in", "pickup", "delivery"].map((l, i) => (
              <Box key={l} x={16} y={40 + i * 56} w={80} h={28} label={l} />
            ))}
            <path d="M96 54 H112 V166 H96" {...LINE} />
            <Box x={130} y={92} w={64} h={36} label="Java" />
            <path d="M212 54 V166" {...LINE} />
            <path d="M194 110 H212" {...LINE} />
            <Arrow x1={212} y1={54} x2={228} y2={54} />
            <Arrow x1={212} y1={166} x2={228} y2={166} />
            {["orders", "items", "stock"].map((l, i) => (
              <Box key={l} x={230} y={40 + i * 56} w={76} h={28} label={l} accent={i === 1} />
            ))}
            <Flow d="M112 110 H128 M212 110 H228" heads={[{ x: 128, y: 110, a: R }, { x: 228, y: 110, a: R }]} />
            <Txt x={56} y={206} dim>order types</Txt>
            <Txt x={268} y={206} dim>AWS RDS</Txt>
          </>
        ),
      };
    case "drown":
      return {
        label: "An attacker repeatedly probes an SSLv2 server, uses its replies as an oracle, and recovers the RSA key",
        body: (
          <>
            <Box x={16} y={76} w={88} h={44} label="attacker" />
            <Box x={208} y={76} w={96} h={44} label="SSLv2 server" />
            <Arrow x1={104} y1={90} x2={206} y2={90} />
            <Arrow x1={208} y1={106} x2={106} y2={106} />
            <Txt x={156} y={82} dim>probe</Txt>
            <Txt x={156} y={124} dim>oracle reply</Txt>
            <Flow d="M60 76 V52 Q60 44 68 44 H248 Q256 44 256 52 V74" heads={[{ x: 256, y: 74, a: D }]} />
            <Txt x={156} y={34}>repeat</Txt>
            <Arrow x1={60} y1={120} x2={60} y2={150} />
            <Box x={16} y={152} w={88} h={32} label="RSA key" accent />
            <Txt x={116} y={172} anchor="start" dim>private key recovered</Txt>
          </>
        ),
      };
    case "space-hangman": {
      const start = 46;
      return {
        label: "A satellite orbits a planet while letter slots fill in as the player guesses",
        body: (
          <>
            <circle cx={160} cy={84} r={20} fill="var(--raised)" stroke={S} strokeWidth={1.5} />
            <ellipse cx={160} cy={84} rx={96} ry={44} {...LINE} strokeDasharray="2 5" />
            <Flow d="M256 84 C256 59.7 213 40 160 40" />
            <circle cx={160} cy={40} r={5} fill="var(--raised)" stroke={ACC} strokeWidth={2} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const hit = i === 1 || i === 4;
              const x = start + i * 40;
              return (
                <g key={i}>
                  <path d={`M${x} 176 h28`} stroke={hit ? ACC : S} strokeWidth={2} strokeLinecap="round" />
                  {hit && <Txt x={x + 14} y={168}>{i === 1 ? "a" : "r"}</Txt>}
                </g>
              );
            })}
            <Txt x={160} y={204} dim>guess the word</Txt>
          </>
        ),
      };
    }
    case "sysmon": {
      const xs = Array.from({ length: 9 }, (_, i) => 72 + i * 28);
      const rows = [
        { l: "cpu", y0: 20 },
        { l: "mem", y0: 86 },
        { l: "net", y0: 152 },
      ];
      const cpu = [8, 14, 10, 20, 16, 36, 18, 12, 10];
      const mem = [12, 14, 16, 18, 22, 24, 28, 32, 36];
      const net = [6, 18, 8, 22, 10, 16, 6, 20, 12];
      const line = (y0: number, v: number[]) => v.map((h, i) => `${i ? "L" : "M"}${xs[i]} ${y0 + 40 - h}`).join(" ");
      return {
        label: "Live CPU, memory and network readings, with an alert when CPU crosses the threshold",
        body: (
          <>
            {rows.map((r) => (
              <g key={r.l}>
                <Txt x={16} y={r.y0 + 24} anchor="start" dim>{r.l}</Txt>
                <path d={`M66 ${r.y0 + 40} H302`} stroke={S} strokeWidth={1} />
              </g>
            ))}
            <path d={`M66 ${20 + 12} H302`} stroke={S} strokeWidth={1} strokeDasharray="3 4" />
            <Txt x={302} y={24} anchor="end" dim>alert</Txt>
            <Flow d={line(20, cpu)} />
            <circle cx={xs[5]} cy={20 + 40 - cpu[5]} r={3.5} fill={ACC} className="pd-head" />
            {mem.map((h, i) => (
              <rect key={i} x={xs[i] - 6} y={86 + 40 - h} width={12} height={h} rx={2} fill="var(--raised)" stroke={S} strokeWidth={1.5} />
            ))}
            <path d={line(152, net)} {...LINE} />
          </>
        ),
      };
    }
    case "voicerx":
      return {
        label: "A clinician speaks to Alexa, which updates the electronic medical record",
        body: (
          <>
            <path d="M28 92 v16 M38 82 v36 M48 72 v56 M58 82 v36 M68 92 v16" stroke={S} strokeWidth={2.5} strokeLinecap="round" />
            <Txt x={48} y={150} dim>clinician</Txt>
            <Arrow x1={80} y1={100} x2={116} y2={100} />
            <Box x={118} y={78} w={68} h={44} label="Alexa" />
            <Box x={222} y={52} w={82} h={96} />
            <Txt x={263} y={74}>EMR</Txt>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M234 ${96 + i * 18} h${i === 1 ? 40 : 58}`} stroke={i === 1 ? ACC : S} strokeWidth={1.5} strokeLinecap="round" />
            ))}
            <Flow d="M186 100 H220" heads={[{ x: 220, y: 100, a: R }]} />
            <Txt x={160} y={196} dim>records updated by voice</Txt>
          </>
        ),
      };
    case "healthfit":
      return {
        label: "A client sends a token and a weight goal to a REST API, which returns a daily calorie target",
        body: (
          <>
            <Box x={16} y={86} w={64} h={48} label="client" />
            <Arrow x1={80} y1={100} x2={122} y2={100} />
            <Arrow x1={80} y1={120} x2={122} y2={120} />
            <Txt x={100} y={91} dim>token</Txt>
            <Txt x={100} y={137} dim>goal</Txt>
            <Box x={124} y={58} w={84} h={104} r={8} />
            <Txt x={166} y={82}>REST API</Txt>
            <path d="M136 96 H196" stroke={S} strokeWidth={1} strokeDasharray="2 4" />
            <Txt x={166} y={134} dim>heuristics</Txt>
            <Flow d="M208 110 H226" heads={[{ x: 226, y: 110, a: R }]} />
            <Box x={228} y={90} w={76} h={40} label="kcal/day" accent />
            <Txt x={266} y={150} dim>daily target</Txt>
          </>
        ),
      };
    case "tweetfeel":
      return {
        label: "Tweets are embedded and run through a recurrent network that outputs an emotion",
        body: (
          <>
            <Txt x={42} y={52} dim>tweets</Txt>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={16} y={64 + i * 30} width={52} height={22} rx={11} fill="var(--raised)" stroke={S} strokeWidth={1.5} />
                <path d={`M27 ${75 + i * 30} h${i === 1 ? 22 : 30}`} stroke={S} strokeWidth={1.5} strokeLinecap="round" />
              </g>
            ))}
            <path d="M68 75 H80 V135 H68 M68 105 H80" {...LINE} />
            <Arrow x1={80} y1={105} x2={96} y2={105} />
            <Box x={98} y={89} w={56} h={32} label="embed" />
            <Arrow x1={154} y1={105} x2={172} y2={105} />
            {[186, 218, 250].map((cx) => (
              <circle key={cx} cx={cx} cy={105} r={12} fill="var(--raised)" stroke={S} strokeWidth={1.5} />
            ))}
            <path d="M198 105 H206 M230 105 H238" {...LINE} />
            <Flow d="M186 93 C190 72 214 72 218 92 C222 72 246 72 250 92" heads={[{ x: 250, y: 92, a: 1.35 }]} />
            <Txt x={218} y={60}>RNN</Txt>
            <Arrow x1={218} y1={117} x2={218} y2={156} />
            <Box x={170} y={158} w={96} h={30} label="emotion" accent />
          </>
        ),
      };
    case "neural-style":
      return {
        label: "A content image and a style image feed a loss that is optimized into a stylized result",
        body: (
          <>
            <Box x={16} y={24} w={68} h={52} />
            <path d="M24 68 L40 46 L52 58 L64 40 L76 68" {...LINE} />
            <Txt x={50} y={92} dim>content</Txt>
            <Box x={16} y={124} w={68} h={52} />
            <path d="M24 144 q8 -10 16 0 t16 0 t16 0 M24 160 q8 -10 16 0 t16 0 t16 0" {...LINE} />
            <Txt x={50} y={192} dim>style</Txt>
            <path d="M84 50 H100 V150 H84" {...LINE} />
            <Arrow x1={100} y1={100} x2={126} y2={100} />
            <Box x={128} y={82} w={60} h={36} label="loss" />
            <Txt x={158} y={48} dim>optimize</Txt>
            <Box x={224} y={72} w={80} h={56} accent />
            <path d="M232 120 L250 94 L262 106 L278 84 L296 120" fill="none" stroke={ACC} strokeWidth={1.5} strokeLinejoin="round" />
            <path d="M234 90 q7 -8 14 0 t14 0 t14 0 t14 0" fill="none" stroke={ACC} strokeWidth={1} opacity={0.7} />
            <Txt x={264} y={146} dim>result</Txt>
            <Flow d="M172 82 C172 58 144 58 144 80 M188 100 H222" heads={[{ x: 144, y: 80, a: D }, { x: 222, y: 100, a: R }]} />
          </>
        ),
      };
    case "iot-automation":
      return {
        label: "A NodeMCU board on Wi-Fi drives a relay that switches an ordinary appliance",
        body: (
          <>
            <path d="M32 96 Q44 84 56 96 M22 86 Q44 64 66 86" {...LINE} />
            <circle cx={44} cy={106} r={3} fill={S} />
            <Txt x={44} y={132} dim>Wi-Fi</Txt>
            <Arrow x1={72} y1={100} x2={108} y2={100} />
            <Box x={110} y={78} w={80} h={44} label="NodeMCU" />
            <Txt x={150} y={142} dim>Java firmware</Txt>
            <Box x={220} y={82} w={56} h={36} label="relay" />
            <Box x={200} y={152} w={96} h={36} label="appliance" accent />
            <Flow d="M190 100 H218 M248 118 V150" heads={[{ x: 218, y: 100, a: R }, { x: 248, y: 150, a: D }]} />
          </>
        ),
      };
    case "fraud": {
      const pt = { x: 192, y: 84 };
      const nn = [
        [222, 104],
        [232, 60],
        [250, 84],
      ];
      const seg = nn
        .map(([x, y]) => {
          const len = Math.hypot(x - pt.x, y - pt.y);
          const ux = (x - pt.x) / len;
          const uy = (y - pt.y) / len;
          return `M${(pt.x + ux * 9).toFixed(1)} ${(pt.y + uy * 9).toFixed(1)} L${(x - ux * 11).toFixed(1)} ${(y - uy * 11).toFixed(1)}`;
        })
        .join(" ");
      const cross = (x: number, y: number) => `M${x - 4.5} ${y - 4.5} l9 9 M${x + 4.5} ${y - 4.5} l-9 9`;
      return {
        label: "A new transaction is labeled by its three nearest neighbors, which are fraud cases",
        body: (
          <>
            <path d="M24 16 V184 H304" {...LINE} />
            {[[60, 150], [84, 132], [70, 112], [108, 156], [98, 100], [124, 128], [52, 128]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={4.5} fill="none" stroke={S} strokeWidth={1.5} />
            ))}
            {[[232, 60], [250, 84], [222, 104], [266, 56], [278, 96]].map(([x, y], i) => (
              <path key={i} d={cross(x, y)} stroke={S} strokeWidth={1.5} strokeLinecap="round" />
            ))}
            <circle cx={pt.x} cy={pt.y} r={64} fill="none" stroke={S} strokeWidth={1} strokeDasharray="3 4" />
            <Flow d={seg} />
            <circle cx={pt.x} cy={pt.y} r={5} fill={ACC} />
            <Txt x={182} y={102} anchor="end">new</Txt>
            <Txt x={192} y={166} dim>k = 3</Txt>
            <circle cx={40} cy={202} r={4} fill="none" stroke={S} strokeWidth={1.5} />
            <Txt x={50} y={206} anchor="start" dim>legit</Txt>
            <path d={cross(112, 202)} stroke={S} strokeWidth={1.5} strokeLinecap="round" />
            <Txt x={122} y={206} anchor="start" dim>fraud</Txt>
          </>
        ),
      };
    }
    default:
      return {
        label: `${p.title}: input goes through a process to produce an output`,
        body: (
          <>
            <Box x={16} y={88} w={80} h={44} label="input" />
            <Box x={120} y={88} w={80} h={44} label="process" />
            <Box x={224} y={88} w={80} h={44} label="output" accent />
            <Arrow x1={96} y1={110} x2={118} y2={110} />
            <Flow d="M200 110 H222" heads={[{ x: 222, y: 110, a: R }]} />
          </>
        ),
      };
  }
}

export function ProjectDiagram({ project }: { project: Project }) {
  const { label, body } = build(project);
  return (
    <svg
      className="pd-svg"
      viewBox="0 0 320 220"
      width="100%"
      role="img"
      aria-label={label}
      style={{ ["--pd-acc" as string]: projectAccent(project) }}
    >
      <style>{css}</style>
      {body}
    </svg>
  );
}
