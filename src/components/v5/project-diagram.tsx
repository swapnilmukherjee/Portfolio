import type { ReactNode } from "react";
import type { Project } from "@/data/content-types";

/**
 * Small code-drawn explainers, one per project. Structure uses --line-strong,
 * the main flow path uses the accent (class "pd-draw") and draws in when an
 * ancestor has data-active="true".
 */

const S = "var(--line-strong)";
const ACC = "var(--pd-acc)";

const css = `
.pd-svg{display:block;width:100%;height:auto;overflow:visible}
.pd-svg text{font-family:var(--font-code);font-size:11px;fill:var(--text-2)}
.pd-svg .pd-dim{fill:var(--muted)}
[data-active="false"] .pd-draw{stroke-dasharray:1;stroke-dashoffset:1}
[data-active="true"] .pd-draw{stroke-dasharray:1;stroke-dashoffset:0;animation:pd-draw 700ms var(--ease-out) both}
@keyframes pd-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){[data-active] .pd-draw{animation:none;stroke-dasharray:none;stroke-dashoffset:0}}
`;

export function projectAccent(p: Project): string {
  if (p.category === "Cybersecurity" && !p.tags.some((t) => /auth0|iam|oauth/i.test(t))) return "var(--c1)";
  if (p.tags.some((t) => /auth0|iam|oauth/i.test(t))) return "var(--c3)";
  if (p.category === "Cybersecurity") return "var(--c1)";
  return "var(--c2)";
}

function Box({ x, y, w, h, label, accent, dim }: { x: number; y: number; w: number; h: number; label?: string; accent?: boolean; dim?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke={accent ? ACC : S} strokeWidth={1.5} />
      {label && (
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" className={dim ? "pd-dim" : undefined}>
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

/** Straight arrow with a small head. */
function Arrow({ x1, y1, x2, y2, accent }: { x1: number; y1: number; x2: number; y2: number; accent?: boolean }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 5;
  const p1 = [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)];
  const p2 = [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)];
  return (
    <g stroke={accent ? ACC : S} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path d={`M${p1[0]} ${p1[1]} L${x2} ${y2} L${p2[0]} ${p2[1]}`} />
    </g>
  );
}

function Flow({ d }: { d: string }) {
  return <path className="pd-draw" d={d} pathLength={1} fill="none" stroke={ACC} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />;
}

type Spec = { label: string; body: ReactNode };

function build(p: Project): Spec {
  switch (p.id) {
    case "project-movzuup5":
      return {
        label: "Four roles pass through a policy gate that checks token permissions before reaching the API",
        body: (
          <>
            {["Tenant Admin", "Analyst", "Billing", "Viewer"].map((r, i) => (
              <g key={r}>
                <Box x={8} y={20 + i * 46} w={92} h={30} label={r} />
                <Arrow x1={100} y1={35 + i * 46} x2={138} y2={35 + i * 46} />
              </g>
            ))}
            <rect x={140} y={14} width={50} height={192} rx={10} fill="none" stroke={S} strokeWidth={1.5} />
            <Txt x={165} y={116} dim>gate</Txt>
            <path d="M165 28 v62 M165 128 v62" stroke={S} strokeWidth={1.5} fill="none" strokeDasharray="2 5" />
            <Flow d="M100 35 H122 V110 H212" />
            <Box x={212} y={90} w={100} h={40} label="API" accent />
            <Txt x={262} y={150} dim>allow / deny</Txt>
          </>
        ),
      };
    case "tripshare":
      return {
        label: "Two traveler routes with overlapping segments merge into one shared ride",
        body: (
          <>
            <circle cx={24} cy={50} r={5} fill="none" stroke={S} strokeWidth={1.5} />
            <circle cx={24} cy={170} r={5} fill="none" stroke={S} strokeWidth={1.5} />
            <path d="M29 50 C100 50 100 110 150 110" fill="none" stroke={S} strokeWidth={1.5} />
            <path d="M29 170 C100 170 100 110 150 110" fill="none" stroke={S} strokeWidth={1.5} />
            <Flow d="M150 110 H284" />
            <circle cx={150} cy={110} r={6} fill="var(--raised)" stroke={ACC} strokeWidth={2} />
            <circle cx={290} cy={110} r={5} fill="none" stroke={ACC} strokeWidth={2} />
            <Txt x={24} y={34} dim>trip A</Txt>
            <Txt x={24} y={196} dim>trip B</Txt>
            <Txt x={150} y={92}>match</Txt>
            <Txt x={220} y={132}>shared ride</Txt>
          </>
        ),
      };
    case "fast-fuzzer":
      return {
        label: "Specification, binary and test suite feed a mutator loop that reports coverage",
        body: (
          <>
            {["spec", "binary", "tests"].map((l, i) => (
              <g key={l}>
                <Box x={8} y={22 + i * 38} w={66} h={28} label={l} />
                <Arrow x1={74} y1={36 + i * 38} x2={104} y2={36 + i * 38} />
              </g>
            ))}
            <rect x={106} y={16} width={72} height={106} rx={8} fill="none" stroke={S} strokeWidth={1.5} />
            <Txt x={142} y={48}>mutate</Txt>
            <Txt x={142} y={90}>run</Txt>
            <Flow d="M142 54 V78 M142 96 C170 100 170 44 142 48" />
            <Arrow x1={178} y1={70} x2={206} y2={70} accent />
            {[18, 34, 26, 48, 40].map((h, i) => (
              <rect key={i} x={212 + i * 20} y={110 - h} width={12} height={h} rx={2} fill="none" stroke={i === 3 ? ACC : S} strokeWidth={1.5} />
            ))}
            <Txt x={262} y={132} dim>coverage</Txt>
            <path d="M8 150 H312" stroke={S} strokeWidth={1} strokeDasharray="2 5" />
            <Txt x={160} y={180}>gaps between spec and code</Txt>
            <Txt x={160} y={198} dim>show up as blind spots</Txt>
          </>
        ),
      };
    case "pizzeria":
      return {
        label: "Order types flow through a Java pipeline into normalized SQL tables",
        body: (
          <>
            {["dine-in", "pickup", "delivery"].map((l, i) => (
              <g key={l}>
                <Box x={8} y={30 + i * 50} w={70} h={30} label={l} />
                <Arrow x1={78} y1={45 + i * 50} x2={108} y2={45 + i * 50} />
              </g>
            ))}
            <Box x={110} y={78} w={70} h={34} label="Java" />
            <Flow d="M108 45 L110 45 V95 H180 M180 95 H212" />
            {["orders", "items", "stock"].map((l, i) => (
              <Box key={l} x={214} y={26 + i * 56} w={92} h={34} label={l} accent={i === 1} />
            ))}
            <path d="M260 60 V82 M260 116 V138" stroke={S} strokeWidth={1.5} strokeDasharray="3 4" />
            <Txt x={260} y={204} dim>SQL on AWS RDS</Txt>
          </>
        ),
      };
    case "drown":
      return {
        label: "An attacker loops queries against an SSLv2 oracle to recover the RSA private key",
        body: (
          <>
            <Box x={8} y={80} w={90} h={60} label="attacker" />
            <Box x={222} y={80} w={90} h={60} label="SSLv2 oracle" />
            <Arrow x1={98} y1={96} x2={222} y2={96} />
            <Arrow x1={222} y1={124} x2={98} y2={124} />
            <Txt x={160} y={88} dim>probe</Txt>
            <Txt x={160} y={142} dim>padding ok?</Txt>
            <Flow d="M53 80 C53 40 100 30 140 30 C180 30 205 36 205 56" />
            <Txt x={110} y={22} dim>repeat</Txt>
            <path d="M53 140 V176" stroke={S} strokeWidth={1.5} />
            <Box x={8} y={176} w={90} h={30} label="RSA key" accent />
          </>
        ),
      };
    case "space-hangman":
      return {
        label: "A satellite orbits a planet while letter slots fill in as the player guesses",
        body: (
          <>
            <circle cx={160} cy={80} r={20} fill="none" stroke={S} strokeWidth={1.5} />
            <ellipse cx={160} cy={80} rx={96} ry={44} fill="none" stroke={S} strokeWidth={1.5} strokeDasharray="2 5" />
            <Flow d="M256 80 C256 56 210 36 160 36" />
            <circle cx={160} cy={36} r={5} fill="var(--raised)" stroke={ACC} strokeWidth={2} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i}>
                <path d={`M${40 + i * 40} 180 h28`} stroke={i === 1 || i === 4 ? ACC : S} strokeWidth={2} strokeLinecap="round" />
                {(i === 1 || i === 4) && <Txt x={54 + i * 40} y={172}>{i === 1 ? "a" : "r"}</Txt>}
              </g>
            ))}
            <Txt x={160} y={206} dim>letters</Txt>
          </>
        ),
      };
    case "sysmon":
      return {
        label: "Sparkline bars for CPU, memory and disk readings with an alert threshold line",
        body: (
          <>
            {[
              { l: "cpu", y: 20, v: [14, 22, 18, 30, 26, 38, 20, 16] },
              { l: "mem", y: 88, v: [24, 26, 28, 30, 34, 36, 40, 44] },
              { l: "disk", y: 156, v: [20, 20, 22, 20, 24, 22, 22, 24] },
            ].map((row, r) => (
              <g key={row.l}>
                <Txt x={8} y={row.y + 36} anchor="start" dim>{row.l}</Txt>
                {row.v.map((h, i) => (
                  <rect key={i} x={58 + i * 30} y={row.y + 50 - h} width={18} height={h} rx={2} fill="none" stroke={r === 0 && i === 5 ? ACC : S} strokeWidth={1.5} />
                ))}
              </g>
            ))}
            <path d="M52 40 H304" stroke={S} strokeWidth={1} strokeDasharray="3 4" />
            <Flow d="M58 62 L88 54 L118 58 L148 46 L178 50 L208 36 L238 56 L268 60" />
            <Txt x={304} y={34} anchor="end" dim>alert</Txt>
          </>
        ),
      };
    case "voicerx":
      return {
        label: "A clinician's voice goes through Alexa to update an electronic medical record",
        body: (
          <>
            <path d="M24 90 v20 M34 80 v40 M44 70 v60 M54 80 v40 M64 90 v20" stroke={S} strokeWidth={2.5} strokeLinecap="round" />
            <Txt x={44} y={152} dim>clinician</Txt>
            <Arrow x1={80} y1={100} x2={116} y2={100} />
            <Box x={118} y={74} w={68} h={52} label="Alexa" />
            <Flow d="M186 100 H222" />
            <Box x={224} y={50} w={88} h={100} />
            <Txt x={268} y={72}>EMR</Txt>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M236 ${90 + i * 18} h${i === 1 ? 44 : 64}`} stroke={i === 1 ? ACC : S} strokeWidth={1.5} strokeLinecap="round" />
            ))}
            <Txt x={160} y={196} dim>entry and updates by voice</Txt>
          </>
        ),
      };
    case "healthfit":
      return {
        label: "A signed-in request carries a weight goal to a REST endpoint that returns a daily calorie target",
        body: (
          <>
            <Box x={8} y={80} w={80} h={50} label="client" />
            <Arrow x1={88} y1={96} x2={140} y2={96} />
            <Txt x={114} y={88} dim>token</Txt>
            <rect x={142} y={30} width={90} height={150} rx={8} fill="none" stroke={S} strokeWidth={1.5} />
            <Txt x={187} y={56}>REST API</Txt>
            <path d="M154 74 H220 M154 98 H220" stroke={S} strokeWidth={1.5} strokeDasharray="2 5" />
            <Txt x={187} y={128}>heuristics</Txt>
            <Flow d="M232 120 C262 120 262 150 292 150" />
            <Arrow x1={88} y1={118} x2={140} y2={118} />
            <Txt x={114} y={134} dim>goal</Txt>
            <Box x={236} y={150} w={76} h={34} label="kcal/day" accent />
          </>
        ),
      };
    case "tweetfeel":
      return {
        label: "Tweets are cleaned, embedded and passed through a recurrent network that outputs emotions",
        body: (
          <>
            {[0, 1, 2].map((i) => (
              <rect key={i} x={8} y={50 + i * 36} width={56} height={26} rx={13} fill="none" stroke={S} strokeWidth={1.5} />
            ))}
            <Txt x={36} y={36} dim>tweets</Txt>
            <Arrow x1={66} y1={100} x2={96} y2={100} />
            <Box x={98} y={80} w={58} h={40} label="embed" />
            <Arrow x1={156} y1={100} x2={178} y2={100} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={196 + i * 34} cy={100} r={13} fill="none" stroke={S} strokeWidth={1.5} />
            ))}
            <Flow d="M209 100 H217 M243 100 H251 M196 87 C196 60 230 60 230 87 M230 87 C230 60 264 60 264 87" />
            <Txt x={230} y={150} dim>RNN</Txt>
            <Arrow x1={264} y1={118} x2={264} y2={170} />
            <Box x={218} y={172} w={92} h={30} label="emotion" accent />
          </>
        ),
      };
    case "neural-style":
      return {
        label: "A content image and a style image are optimized together into a stylized result",
        body: (
          <>
            <Box x={8} y={24} w={72} h={56} />
            <path d="M16 70 L32 50 L46 62 L60 40 L72 70" fill="none" stroke={S} strokeWidth={1.5} strokeLinejoin="round" />
            <Txt x={44} y={98} dim>content</Txt>
            <Box x={8} y={120} w={72} h={56} />
            <path d="M16 140 q10 -14 20 0 t20 0 t16 0 M16 158 q10 -14 20 0 t20 0 t16 0" fill="none" stroke={S} strokeWidth={1.5} />
            <Txt x={44} y={194} dim>style</Txt>
            <Arrow x1={80} y1={52} x2={140} y2={92} />
            <Arrow x1={80} y1={148} x2={140} y2={108} />
            <Box x={142} y={76} w={66} h={48} label="loss" />
            <Flow d="M175 76 C175 40 225 40 225 76 M225 76 H232" />
            <Txt x={200} y={34} dim>optimize</Txt>
            <Arrow x1={208} y1={100} x2={236} y2={100} accent />
            <Box x={238} y={72} w={72} h={56} accent />
            <path d="M246 118 q10 -26 20 -4 t20 -4 t16 4" fill="none" stroke={ACC} strokeWidth={1.5} />
            <Txt x={274} y={146} dim>result</Txt>
          </>
        ),
      };
    case "iot-automation":
      return {
        label: "A NodeMCU board on the network switches a legacy appliance through a relay",
        body: (
          <>
            <path d="M20 90 q20 -26 40 0 M10 78 q30 -40 60 0" fill="none" stroke={S} strokeWidth={1.5} strokeLinecap="round" />
            <circle cx={40} cy={98} r={3} fill={S} />
            <Txt x={40} y={124} dim>network</Txt>
            <Arrow x1={78} y1={92} x2={110} y2={92} />
            <Box x={112} y={62} w={84} h={62} label="NodeMCU" />
            <Txt x={154} y={142} dim>Java firmware</Txt>
            <Flow d="M196 92 H226" />
            <Box x={228} y={72} w={34} h={40} label="K" dim />
            <path d="M262 92 H284" stroke={S} strokeWidth={1.5} />
            <Box x={236} y={152} w={76} h={36} label="appliance" accent />
            <Flow d="M245 112 V152" />
            <Txt x={245} y={64} dim>relay</Txt>
          </>
        ),
      };
    case "fraud":
      return {
        label: "A new transaction is classified by its nearest labeled neighbors in feature space",
        body: (
          <>
            <path d="M24 190 V24 M24 190 H300" stroke={S} strokeWidth={1.5} fill="none" />
            {[[60, 150], [84, 130], [70, 110], [104, 150], [96, 96], [120, 120]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={5} fill="none" stroke={S} strokeWidth={1.5} />
            ))}
            {[[230, 54], [254, 76], [214, 80], [268, 46]].map(([x, y], i) => (
              <path key={i} d={`M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10`} stroke={S} strokeWidth={1.5} />
            ))}
            <circle cx={176} cy={100} r={6} fill={ACC} stroke="none" />
            <circle className="pd-draw" cx={176} cy={100} r={46} pathLength={1} fill="none" stroke={ACC} strokeWidth={2} strokeDasharray="3 4" />
            <Txt x={176} y={168} dim>k nearest decide</Txt>
          </>
        ),
      };
    default:
      return {
        label: `${p.title}: input goes through a process to produce an output`,
        body: (
          <>
            <Box x={8} y={80} w={80} h={60} label="input" />
            <Box x={120} y={80} w={80} h={60} label="process" accent />
            <Box x={232} y={80} w={80} h={60} label="output" />
            <Arrow x1={88} y1={110} x2={120} y2={110} />
            <Flow d="M200 110 H232" />
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
