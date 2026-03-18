import { type WeatherCondition } from "@/hooks/use-weather";

// Animated CSS weather backgrounds
const sceneStyles: Record<WeatherCondition, { bg: string; overlay: string; emoji: string }> = {
  sunny: {
    bg: "bg-gradient-to-br from-amber-300/30 via-yellow-200/20 to-orange-200/20",
    overlay: "",
    emoji: "☀️",
  },
  "partly-cloudy": {
    bg: "bg-gradient-to-br from-sky-200/25 via-slate-200/15 to-amber-100/20",
    overlay: "",
    emoji: "⛅",
  },
  cloudy: {
    bg: "bg-gradient-to-br from-slate-300/30 via-gray-200/20 to-slate-200/25",
    overlay: "",
    emoji: "☁️",
  },
  rainy: {
    bg: "bg-gradient-to-br from-slate-400/30 via-blue-300/20 to-indigo-300/20",
    overlay: "",
    emoji: "🌧️",
  },
  snowy: {
    bg: "bg-gradient-to-br from-blue-100/30 via-white/20 to-slate-100/25",
    overlay: "",
    emoji: "❄️",
  },
  stormy: {
    bg: "bg-gradient-to-br from-slate-500/30 via-purple-400/15 to-gray-400/25",
    overlay: "",
    emoji: "⛈️",
  },
  foggy: {
    bg: "bg-gradient-to-br from-gray-300/30 via-slate-200/25 to-gray-200/20",
    overlay: "",
    emoji: "🌫️",
  },
  "clear-night": {
    bg: "bg-gradient-to-br from-indigo-900/30 via-slate-800/20 to-purple-900/20",
    overlay: "",
    emoji: "🌙",
  },
};

// Animated particles for rain / snow
function RainDrops() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-[2px] bg-blue-400/40 rounded-full animate-rain"
          style={{
            left: `${8 + i * 8}%`,
            height: `${10 + (i % 3) * 6}px`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.6 + (i % 3) * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function SnowFlakes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-white/60 rounded-full animate-snow"
          style={{
            left: `${5 + i * 10}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${2 + (i % 3) * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

function SunRays() {
  return (
    <div className="absolute -top-4 -right-4 w-20 h-20 pointer-events-none">
      <div className="w-full h-full rounded-full bg-yellow-300/20 blur-xl animate-pulse" />
    </div>
  );
}

interface WeatherSceneProps {
  condition: WeatherCondition;
  children: React.ReactNode;
  className?: string;
}

export function WeatherScene({ condition, children, className = "" }: WeatherSceneProps) {
  const scene = sceneStyles[condition];

  return (
    <div className={`relative overflow-hidden rounded-xl ${scene.bg} ${className}`}>
      {/* Animated particles */}
      {(condition === "rainy" || condition === "stormy") && <RainDrops />}
      {condition === "snowy" && <SnowFlakes />}
      {condition === "sunny" && <SunRays />}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Weather emoji indicator */}
      <div className="absolute top-3 right-3 text-lg opacity-70">{scene.emoji}</div>
    </div>
  );
}
