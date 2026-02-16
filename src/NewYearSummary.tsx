import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  staticFile,
  Sequence,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { flip } from "@remotion/transitions/flip";
import { Audio } from "@remotion/media";

// ─── Color Palette ───
const COLORS = {
  bg1: "#0f0c29",
  bg2: "#302b63",
  bg3: "#24243e",
  gold: "#ffd700",
  white: "#ffffff",
  accent: "#00d2ff",
  accent2: "#7b2ff7",
  green: "#00e676",
  orange: "#ff9100",
  pink: "#ff4081",
  cyan: "#00e5ff",
  dimWhite: "rgba(255,255,255,0.6)",
};

// ─── Reusable Scene Wrapper ───
const Scene: React.FC<{
  children: React.ReactNode;
  gradient?: string;
}> = ({ children, gradient }) => (
  <AbsoluteFill
    style={{
      background:
        gradient ??
        `linear-gradient(135deg, ${COLORS.bg1}, ${COLORS.bg2}, ${COLORS.bg3})`,
      justifyContent: "center",
      alignItems: "center",
      fontFamily:
        "'SF Pro Display', 'PingFang SC', 'Noto Sans SC', sans-serif",
      padding: 60,
      overflow: "hidden",
    }}
  >
    {children}
  </AbsoluteFill>
);

// ─── Enhanced Animated Particles with Glow ───
const Particles: React.FC<{ count?: number; color?: string }> = ({
  count = 25,
  color = COLORS.gold,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = ((i * 137.5) % 100);
        const baseY = ((i * 73.7) % 100);
        const y = (baseY + frame * (0.15 + (i % 5) * 0.08)) % 130 - 15;
        const size = 3 + (i % 5) * 3;
        const opacity = 0.1 + (i % 4) * 0.08;
        // Pulsing glow effect driven by frame
        const pulse = Math.sin(frame * 0.05 + i * 0.7) * 0.5 + 0.5;
        const glowSize = size * (2 + pulse * 3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: opacity + pulse * 0.08,
              boxShadow: `0 0 ${glowSize}px ${glowSize / 2}px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

// ─── 3D Card Entrance Helper ───
const Card3D: React.FC<{
  children: React.ReactNode;
  frame: number;
  fps: number;
  delay: number;
  style?: React.CSSProperties;
}> = ({ children, frame, fps, delay, style }) => {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotateX = interpolate(progress, [0, 1], [35, 0]);
  const rotateY = interpolate(progress, [0, 1], [-15, 0]);
  const translateZ = interpolate(progress, [0, 1], [-200, 0]);
  const scale = interpolate(progress, [0, 1], [0.7, 1]);

  return (
    <div
      style={{
        opacity: Math.max(0, opacity),
        perspective: 1200,
        ...style,
      }}
    >
      <div
        style={{
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── Shimmer Text Effect ───
const ShimmerText: React.FC<{
  children: React.ReactNode;
  frame: number;
  color: string;
  style?: React.CSSProperties;
}> = ({ children, frame, color, style }) => {
  const shimmerX = interpolate(frame % 90, [0, 90], [-100, 200]);
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        color,
        ...style,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(105deg, transparent ${shimmerX - 30}%, rgba(255,255,255,0.25) ${shimmerX}%, transparent ${shimmerX + 30}%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ─── Scene 1: Intro Title ───
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleScale = spring({ frame, fps, config: { damping: 8, stiffness: 60 } });
  const titleRotateX = interpolate(titleScale, [0, 1], [25, 0]);

  const yearOpacity = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yearScale = spring({ frame: frame - 30, fps, config: { damping: 10, stiffness: 80 } });
  const yearGlow = Math.sin(frame * 0.06) * 0.4 + 0.6;

  const subtitleOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [60, 80], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  // Exit animation
  const exitProgress = interpolate(frame, [durationInFrames - 15, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = 1 + exitProgress * 0.3;
  const exitOpacity = 1 - exitProgress;

  return (
    <Scene>
      <Particles count={35} />
      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          opacity: exitOpacity,
          transform: `scale(${exitScale})`,
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            transform: `perspective(800px) rotateX(${titleRotateX}deg) scale(${Math.max(0, titleScale)})`,
            color: COLORS.white,
            fontSize: 110,
            fontWeight: 900,
            letterSpacing: 10,
            textShadow: `0 0 60px rgba(255,215,0,0.4), 0 4px 20px rgba(0,0,0,0.5)`,
          }}
        >
          <ShimmerText frame={frame} color={COLORS.white}>
            AI 年度回顾
          </ShimmerText>
        </div>
        <div
          style={{
            opacity: yearOpacity,
            transform: `scale(${Math.max(0, yearScale)})`,
            color: COLORS.gold,
            fontSize: 180,
            fontWeight: 900,
            marginTop: 20,
            textShadow: `0 0 ${80 * yearGlow}px rgba(255,215,0,0.6), 0 0 ${120 * yearGlow}px rgba(255,215,0,0.3)`,
          }}
        >
          2025
        </div>
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            color: COLORS.dimWhite,
            fontSize: 40,
            marginTop: 30,
            letterSpacing: 6,
          }}
        >
          Mar 2025 — Feb 2026
        </div>
      </div>
    </Scene>
  );
};

// ─── Scene 2: Stats Overview ───
const statsData = [
  { number: "2", label: "IEEE Papers\nAccepted", color: COLORS.gold, icon: "📄" },
  { number: "174", label: "Daily Issues\nTracked", color: COLORS.accent, icon: "📋" },
  { number: "30+", label: "Blog Posts\n& Videos", color: COLORS.green, icon: "📝" },
  { number: "20+", label: "Open Source\nProjects", color: COLORS.pink, icon: "🚀" },
];

const StatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const exitOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Scene>
      <Particles count={18} color={COLORS.accent} />
      <div style={{ zIndex: 1, width: "100%", opacity: exitOpacity }}>
        <div
          style={{
            color: COLORS.white,
            fontSize: 60,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 60,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        >
          一年成就总览
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 30,
          }}
        >
          {statsData.map((stat, i) => {
            const delay = i * 12;
            return (
              <Card3D key={i} frame={frame} fps={fps} delay={delay}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 28,
                    padding: "40px 24px",
                    textAlign: "center",
                    border: `1px solid rgba(255,255,255,0.12)`,
                    backdropFilter: "blur(10px)",
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                >
                  <div style={{ fontSize: 56, marginBottom: 10 }}>{stat.icon}</div>
                  <ShimmerText frame={frame} color={stat.color} style={{
                    fontSize: 80,
                    fontWeight: 900,
                    lineHeight: 1,
                  }}>
                    {stat.number}
                  </ShimmerText>
                  <div
                    style={{
                      color: COLORS.dimWhite,
                      fontSize: 26,
                      marginTop: 12,
                      whiteSpace: "pre-line",
                      lineHeight: 1.3,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

// ─── Scene 3: Paper Work Timeline ───
const papers = [
  {
    title: "SecondPaper",
    detail: "S-Box Optimization\nGIFT Cipher · IEEE Journal",
    timeline: "Jul → Oct 2025",
    status: "R1 → R2 → Accepted ✓",
  },
  {
    title: "ThirdPaper",
    detail: "GPU-Accelerated SLH-DSA\nIEEE Computer Architecture Letters",
    timeline: "Aug → Oct 2025",
    status: "R1 → R2 → Accepted ✓",
  },
  {
    title: "Big Paper (Thesis)",
    detail: "Outline · Background · Chapter 2\nIn Progress",
    timeline: "Aug 2025 → Present",
    status: "Writing... 📝",
  },
];

const PaperScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const exitOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Scene gradient={`linear-gradient(160deg, #1a1a2e, #16213e, #0f3460)`}>
      <Particles count={12} color={COLORS.gold} />
      <div style={{ zIndex: 1, width: "100%", opacity: exitOpacity }}>
        <div
          style={{
            color: COLORS.gold,
            fontSize: 60,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 50,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            textShadow: `0 0 30px rgba(255,215,0,0.3)`,
          }}
        >
          📄 学术论文
        </div>
        {papers.map((paper, i) => {
          const delay = 15 + i * 22;
          return (
            <Card3D key={i} frame={frame} fps={fps} delay={delay} style={{ marginBottom: 22 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 22,
                  padding: "30px 32px",
                  borderLeft: `5px solid ${i < 2 ? COLORS.green : COLORS.orange}`,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
                }}
              >
                <div
                  style={{
                    color: COLORS.white,
                    fontSize: 38,
                    fontWeight: 800,
                    marginBottom: 10,
                  }}
                >
                  {paper.title}
                </div>
                <div
                  style={{
                    color: COLORS.dimWhite,
                    fontSize: 24,
                    whiteSpace: "pre-line",
                    lineHeight: 1.4,
                    marginBottom: 10,
                  }}
                >
                  {paper.detail}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.accent, fontSize: 22, fontWeight: 500 }}>
                    {paper.timeline}
                  </span>
                  <span
                    style={{
                      color: i < 2 ? COLORS.green : COLORS.orange,
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {paper.status}
                  </span>
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>
    </Scene>
  );
};

// ─── Scene 4: PhD Journey ───
const PhdScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const checkScale = spring({
    frame: frame - 50,
    fps,
    config: { damping: 6, stiffness: 60 },
  });

  const milestones = [
    { text: "PhD Apply Slide Preparation", month: "Sep 2025" },
    { text: "Materials Collection & Print", month: "Nov-Dec 2025" },
    { text: "English Self-Introduction", month: "Dec 2025" },
    { text: "PHD Exam FINISHED! 🎉", month: "Jan 5, 2026" },
  ];

  const exitOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Scene gradient={`linear-gradient(160deg, #0d0d0d, #1a0a2e, #2d1b69)`}>
      <Particles count={28} color={COLORS.accent2} />
      <div style={{ zIndex: 1, width: "100%", textAlign: "center", opacity: exitOpacity }}>
        <div
          style={{
            color: COLORS.accent2,
            fontSize: 60,
            fontWeight: 800,
            marginBottom: 50,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            textShadow: `0 0 30px rgba(123,47,247,0.4)`,
          }}
        >
          🎓 PhD 之路
        </div>
        <div style={{ position: "relative", paddingLeft: 40 }}>
          {/* Timeline line with glow */}
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 0,
              bottom: 0,
              width: 4,
              background: `linear-gradient(to bottom, ${COLORS.accent2}, ${COLORS.gold})`,
              opacity: interpolate(frame, [10, 30], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              boxShadow: `0 0 15px ${COLORS.accent2}, 0 0 30px ${COLORS.accent2}`,
              borderRadius: 2,
            }}
          />
          {milestones.map((m, i) => {
            const delay = 15 + i * 20;
            const entryProgress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 12, stiffness: 100 },
            });
            const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const slideX = interpolate(entryProgress, [0, 1], [80, 0]);
            const isLast = i === milestones.length - 1;
            return (
              <div
                key={i}
                style={{
                  opacity: Math.max(0, opacity),
                  transform: `translateX(${slideX}px)`,
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: 34,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isLast ? COLORS.gold : COLORS.accent2,
                    border: `3px solid ${isLast ? COLORS.gold : COLORS.accent2}`,
                    boxShadow: `0 0 ${isLast ? 20 : 10}px ${isLast ? COLORS.gold : COLORS.accent2}`,
                  }}
                />
                <div style={{ marginLeft: 34 }}>
                  <div
                    style={{
                      color: isLast ? COLORS.gold : COLORS.white,
                      fontSize: isLast ? 36 : 32,
                      fontWeight: isLast ? 900 : 700,
                      textShadow: isLast ? `0 0 20px rgba(255,215,0,0.5)` : undefined,
                    }}
                  >
                    {m.text}
                  </div>
                  <div style={{ color: COLORS.dimWhite, fontSize: 22, marginTop: 6 }}>
                    {m.month}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Big checkmark with 3D bounce */}
        <div
          style={{
            marginTop: 30,
            transform: `scale(${Math.max(0, checkScale)}) perspective(600px) rotateY(${interpolate(checkScale, [0, 1], [90, 0])}deg)`,
            fontSize: 100,
            filter: `drop-shadow(0 0 20px rgba(255,215,0,0.5))`,
          }}
        >
          ✅
        </div>
      </div>
    </Scene>
  );
};

// ─── Scene 5: Open Source Projects ───
const projects = [
  { name: "blivedm_rs", desc: "Bilibili Live Danmu · Rust + LLM", color: COLORS.orange },
  { name: "all-in-mcp", desc: "Multi MCP Server · v0.3.1", color: COLORS.accent },
  { name: "mc-mod", desc: "Minecraft Build Mod · v1.0.0", color: COLORS.green },
  { name: "map-show-video", desc: "Map Video · Tencent CloudBase", color: COLORS.pink },
  { name: "agent-bench", desc: "Agent Benchmark · MVP", color: COLORS.accent2 },
  { name: "vibe-kanban", desc: "Kanban · Multi-Agent", color: COLORS.gold },
  { name: "opencode-isomo", desc: "OpenCode Fork · Custom Dev", color: COLORS.cyan },
  { name: "storybook", desc: "Game on itch.io", color: COLORS.orange },
  { name: "claude-skills", desc: "Figure Skill for Claude Code", color: COLORS.accent },
  { name: "mvideo", desc: "Video Creation Pipeline", color: COLORS.pink },
];

const OpenSourceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scrollY = interpolate(frame, [15, 110], [0, -280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const exitOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Scene gradient={`linear-gradient(160deg, #0a0a0a, #1a1a2e, #0d2137)`}>
      <Particles count={18} color={COLORS.green} />
      <div style={{ zIndex: 1, width: "100%", opacity: exitOpacity }}>
        <div
          style={{
            color: COLORS.green,
            fontSize: 60,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 40,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            textShadow: `0 0 30px rgba(0,230,118,0.4)`,
          }}
        >
          🚀 开源项目 · 20+
        </div>
        <div style={{ transform: `translateY(${scrollY}px)` }}>
          {projects.map((proj, i) => {
            const delay = 10 + i * 8;
            const entryProgress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 15, stiffness: 120 },
            });
            const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const slideX = interpolate(
              entryProgress,
              [0, 1],
              [i % 2 === 0 ? -200 : 200, 0],
            );
            const rotateY = interpolate(entryProgress, [0, 1], [i % 2 === 0 ? -20 : 20, 0]);
            return (
              <div
                key={i}
                style={{
                  opacity: Math.max(0, opacity),
                  transform: `perspective(800px) translateX(${slideX}px) rotateY(${rotateY}deg)`,
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 18,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 18,
                  padding: "18px 26px",
                  borderLeft: `4px solid ${proj.color}`,
                  boxShadow: `0 4px 16px rgba(0,0,0,0.3)`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: proj.color,
                      fontSize: 30,
                      fontWeight: 800,
                    }}
                  >
                    {proj.name}
                  </div>
                  <div style={{ color: COLORS.dimWhite, fontSize: 22, marginTop: 4 }}>
                    {proj.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

// ─── Scene 6: Blog & Video Content ───
const blogHighlights = [
  "AI Code · DeepSeek R1",
  "Arch Linux Setup Guide",
  "Claude Code Subagents",
  "Neovim AI CodeCompanion",
  "IDE Journey: JetBrains → Claude Code",
  "NixOS Configuration",
  "Wayland Window Managers",
  "OpenCode CLI",
  "Multi-Agent Vibe-Kanban",
  "2025 Transformation Retrospective",
];

const BlogScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const exitOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Scene gradient={`linear-gradient(160deg, #1a0a0a, #2e1a1a, #37210d)`}>
      <Particles count={18} color={COLORS.orange} />
      <div style={{ zIndex: 1, width: "100%", opacity: exitOpacity }}>
        <div
          style={{
            color: COLORS.orange,
            fontSize: 60,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 16,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            textShadow: `0 0 30px rgba(255,145,0,0.4)`,
          }}
        >
          📝 博客 & 视频
        </div>
        <div
          style={{
            color: COLORS.dimWhite,
            fontSize: 30,
            textAlign: "center",
            marginBottom: 40,
            opacity: interpolate(frame, [10, 25], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          30+ 篇技术博客 · 配套 Bilibili 视频
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          {blogHighlights.map((title, i) => {
            const delay = 15 + i * 6;
            const tagProgress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 12, stiffness: 150 },
            });
            const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const scale = interpolate(tagProgress, [0, 1], [0.5, 1]);
            const rotateZ = interpolate(tagProgress, [0, 1], [10, 0]);
            return (
              <div
                key={i}
                style={{
                  opacity: Math.max(0, opacity),
                  transform: `scale(${scale}) rotate(${rotateZ}deg)`,
                  background: "rgba(255,145,0,0.14)",
                  border: "1px solid rgba(255,145,0,0.3)",
                  borderRadius: 14,
                  padding: "12px 22px",
                  color: COLORS.white,
                  fontSize: 24,
                  fontWeight: 600,
                  boxShadow: `0 4px 12px rgba(255,145,0,0.15)`,
                }}
              >
                {title}
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

// ─── Scene 7: Tech Stack & Tools ───
const techItems = [
  { category: "Linux", items: "Arch Linux · NixOS · Wayland", icon: "🐧" },
  { category: "Editors", items: "Neovim · Zed · VSCode", icon: "⌨️" },
  { category: "AI Tools", items: "Claude Code · DeepSeek · Qwen · OpenCode", icon: "🤖" },
  { category: "Languages", items: "Rust · TypeScript · Python", icon: "💻" },
  { category: "WM", items: "Niri · Sway · Hyprland", icon: "🪟" },
];

const TechScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const exitOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Scene gradient={`linear-gradient(160deg, #0a1628, #162447, #1f4068)`}>
      <Particles count={18} color={COLORS.cyan} />
      <div style={{ zIndex: 1, width: "100%", opacity: exitOpacity }}>
        <div
          style={{
            color: COLORS.cyan,
            fontSize: 60,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 50,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            textShadow: `0 0 30px rgba(0,229,255,0.4)`,
          }}
        >
          🛠 技术探索
        </div>
        {techItems.map((tech, i) => {
          const delay = 10 + i * 15;
          return (
            <Card3D key={i} frame={frame} fps={fps} delay={delay} style={{ marginBottom: 26 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(0,229,255,0.07)",
                  borderRadius: 18,
                  padding: "22px 28px",
                  gap: 18,
                  boxShadow: `0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                <div style={{ fontSize: 48 }}>{tech.icon}</div>
                <div>
                  <div style={{ color: COLORS.cyan, fontSize: 32, fontWeight: 800 }}>
                    {tech.category}
                  </div>
                  <div style={{ color: COLORS.dimWhite, fontSize: 24, marginTop: 4 }}>
                    {tech.items}
                  </div>
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>
    </Scene>
  );
};

// ─── Scene 8: Cybersecurity ───
const CyberScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const topics = [
    "pwn.college Challenges",
    "Reverse Engineering",
    "Java Deserialization Vuln",
    "CodeQL Program Analysis",
    "Hack Assembly",
  ];

  const exitOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scanline effect
  const scanlineY = interpolate(frame % 60, [0, 60], [0, 100]);

  return (
    <Scene gradient={`linear-gradient(160deg, #0a0f0a, #0d1f0d, #1a2e1a)`}>
      <Particles count={22} color={COLORS.green} />
      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,230,118,0.02) 3px, rgba(0,230,118,0.02) 4px)`,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: `${scanlineY}%`,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, rgba(0,230,118,0.15), transparent)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div style={{ zIndex: 3, width: "100%", textAlign: "center", opacity: exitOpacity }}>
        <div
          style={{
            color: COLORS.green,
            fontSize: 60,
            fontWeight: 800,
            marginBottom: 50,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            textShadow: `0 0 30px rgba(0,230,118,0.5)`,
          }}
        >
          🔐 网络安全学习
        </div>
        {topics.map((topic, i) => {
          const delay = 12 + i * 10;
          const entryProgress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 120 },
          });
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const slideY = interpolate(entryProgress, [0, 1], [40, 0]);
          const scaleX = interpolate(entryProgress, [0, 1], [0.8, 1]);
          // Typewriter-like reveal for terminal text
          const textLen = topic.length;
          const charsVisible = Math.min(
            textLen,
            Math.floor(interpolate(frame, [delay, delay + textLen * 0.8], [0, textLen], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }))
          );
          const displayText = topic.slice(0, charsVisible);
          const cursorVisible = frame >= delay && charsVisible < textLen;

          return (
            <div
              key={i}
              style={{
                opacity: Math.max(0, opacity),
                transform: `translateY(${slideY}px) scaleX(${scaleX})`,
                color: COLORS.white,
                fontSize: 34,
                fontWeight: 600,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                marginBottom: 26,
                padding: "18px 32px",
                background: "rgba(0,230,118,0.08)",
                borderRadius: 16,
                border: "1px solid rgba(0,230,118,0.18)",
                textAlign: "left",
                boxShadow: `0 4px 16px rgba(0,230,118,0.1)`,
              }}
            >
              <span style={{ color: COLORS.green }}>{`> `}</span>
              {displayText}
              {cursorVisible && (
                <span style={{ color: COLORS.green, opacity: frame % 16 < 8 ? 1 : 0 }}>▌</span>
              )}
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// ─── Scene 9: Diary & Life ───
const DiaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entries = [
    { text: "29 篇手写日记", sub: "Mar–May 2025", icon: "📖" },
    { text: "174 个每日 Issue", sub: "Jul 2025 – Feb 2026", icon: "📋" },
    { text: "每周报告 & 会议", sub: "持续 7 个月", icon: "📊" },
    { text: "偶尔也要休息", sub: '"just play the game" 🎮', icon: "☕" },
  ];

  const exitOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Scene gradient={`linear-gradient(160deg, #1a1a0a, #2e2e1a, #3e3e24)`}>
      <Particles count={18} color={COLORS.gold} />
      <div style={{ zIndex: 1, width: "100%", textAlign: "center", opacity: exitOpacity }}>
        <div
          style={{
            color: COLORS.gold,
            fontSize: 60,
            fontWeight: 800,
            marginBottom: 50,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            textShadow: `0 0 30px rgba(255,215,0,0.4)`,
          }}
        >
          📖 日记 & 生活
        </div>
        {entries.map((entry, i) => {
          const delay = 15 + i * 20;
          return (
            <Card3D key={i} frame={frame} fps={fps} delay={delay} style={{ marginBottom: 26 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  background: "rgba(255,215,0,0.07)",
                  borderRadius: 18,
                  padding: "22px 30px",
                  boxShadow: `0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                <div style={{ fontSize: 52 }}>{entry.icon}</div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: COLORS.white, fontSize: 34, fontWeight: 700 }}>
                    {entry.text}
                  </div>
                  <div style={{ color: COLORS.dimWhite, fontSize: 24, marginTop: 6 }}>
                    {entry.sub}
                  </div>
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>
    </Scene>
  );
};

// ─── Scene 10: Outro ───
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 8, stiffness: 50 },
  });

  const glowPulse = Math.sin(frame * 0.06) * 0.4 + 0.6;
  const rotateY = interpolate(mainScale, [0, 1], [60, 0]);

  const words = ["Keep Building", "Keep Learning", "Keep Sharing", "Keep Growing"];

  return (
    <Scene gradient={`linear-gradient(135deg, #0f0c29, #302b63, #24243e)`}>
      <Particles count={45} color={COLORS.gold} />
      <div style={{ zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            transform: `perspective(800px) scale(${Math.max(0, mainScale)}) rotateY(${rotateY}deg)`,
            color: COLORS.gold,
            fontSize: 160,
            fontWeight: 900,
            textShadow: `0 0 ${60 * glowPulse}px rgba(255,215,0,0.7), 0 0 ${120 * glowPulse}px rgba(255,215,0,0.3), 0 0 ${180 * glowPulse}px rgba(255,215,0,0.15)`,
            marginBottom: 30,
          }}
        >
          2026
        </div>
        <div
          style={{
            opacity: interpolate(frame, [30, 50], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [30, 50], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.exp),
            })}px)`,
            color: COLORS.white,
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: 8,
            marginBottom: 30,
            textShadow: `0 2px 20px rgba(255,255,255,0.3)`,
          }}
        >
          继续前行
        </div>
        <div
          style={{
            opacity: interpolate(frame, [50, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {words.map((word, i) => {
            const wordDelay = 50 + i * 8;
            const wordProgress = spring({
              frame: frame - wordDelay,
              fps,
              config: { damping: 14, stiffness: 120 },
            });
            const wordOpacity = interpolate(frame, [wordDelay, wordDelay + 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const wordY = interpolate(wordProgress, [0, 1], [20, 0]);
            return (
              <div
                key={i}
                style={{
                  opacity: Math.max(0, wordOpacity),
                  transform: `translateY(${wordY}px)`,
                  color: COLORS.dimWhite,
                  fontSize: 34,
                  lineHeight: 1.8,
                  fontWeight: 600,
                }}
              >
                {word}
              </div>
            );
          })}
        </div>
        <div
          style={{
            opacity: interpolate(frame, [90, 105], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            color: COLORS.accent2,
            fontSize: 26,
            marginTop: 40,
          }}
        >
          Made with Remotion + AI
        </div>
      </div>
    </Scene>
  );
};

// ─── Main Composition with TransitionSeries ───
const TRANSITION_DURATION = 15; // frames for each transition

// 30s total = 900 frames @ 30fps
// With 9 transitions * 15 frames overlap = 135, scene sum = 1035
const SCENE_DURATIONS = {
  intro: 95,       // 3.2s
  stats: 95,       // 3.2s
  papers: 110,     // 3.7s
  phd: 110,        // 3.7s
  openSource: 120, // 4.0s
  blog: 95,        // 3.2s
  tech: 95,        // 3.2s
  cyber: 95,       // 3.2s
  diary: 95,       // 3.2s
  outro: 125,      // 4.2s
};

const sceneList: { duration: number; component: React.FC }[] = [
  { duration: SCENE_DURATIONS.intro, component: IntroScene },
  { duration: SCENE_DURATIONS.stats, component: StatsScene },
  { duration: SCENE_DURATIONS.papers, component: PaperScene },
  { duration: SCENE_DURATIONS.phd, component: PhdScene },
  { duration: SCENE_DURATIONS.openSource, component: OpenSourceScene },
  { duration: SCENE_DURATIONS.blog, component: BlogScene },
  { duration: SCENE_DURATIONS.tech, component: TechScene },
  { duration: SCENE_DURATIONS.cyber, component: CyberScene },
  { duration: SCENE_DURATIONS.diary, component: DiaryScene },
  { duration: SCENE_DURATIONS.outro, component: OutroScene },
];

// Total duration = sum of all scene durations - (number of transitions * transition duration)
const NUM_TRANSITIONS = sceneList.length - 1;
export const TOTAL_DURATION =
  Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0) -
  NUM_TRANSITIONS * TRANSITION_DURATION;

const T_TIMING = linearTiming({ durationInFrames: TRANSITION_DURATION });

export const NewYearSummary: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {/* Background music with fade in/out */}
      <Audio
        src={staticFile("bgm.mp3")}
        volume={(f) => {
          // Fade in over 1s, fade out over 2s at the end
          const fadeIn = interpolate(f, [0, 1 * fps], [0, 0.7], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [TOTAL_DURATION - 2 * fps, TOTAL_DURATION],
            [0.7, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return Math.min(fadeIn, fadeOut);
        }}
      />
      {/* Persistent author watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          right: 50,
          zIndex: 100,
          color: "rgba(255,255,255,0.4)",
          fontSize: 42,
          fontWeight: 700,
          fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
          letterSpacing: 3,
          pointerEvents: "none",
        }}
      >
        @isomoes
      </div>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.intro}>
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T_TIMING} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.stats}>
          <StatsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={T_TIMING} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.papers}>
          <PaperScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T_TIMING} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.phd}>
          <PhdScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={T_TIMING} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.openSource}>
          <OpenSourceScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={flip({ direction: "from-right" })} timing={T_TIMING} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.blog}>
          <BlogScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T_TIMING} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.tech}>
          <TechScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={T_TIMING} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.cyber}>
          <CyberScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T_TIMING} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.diary}>
          <DiaryScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={T_TIMING} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.outro}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
