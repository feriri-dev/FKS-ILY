import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { Heart, Clock, MapPin, CalendarHeart, ChevronUp, Tv, ListChecks, Thermometer, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWeather, getCondition, getConditionLabel } from "@/hooks/use-weather";
import { WeatherScene } from "@/components/WeatherScene";

const MET_DATE = new Date(2024, 2, 19);
const DATING_DATE = new Date(2025, 8, 2);
const NEXT_MEETING: Date | null = null;

const PARIS_TZ = "Europe/Paris";
const TASHKENT_TZ = "Asia/Tashkent";

const utilities = [
  { label: "Teleparty", url: "https://www.teleparty.com/", icon: Tv },
  { label: "Wishlist / Dates", url: "/todos", icon: ListChecks },
];

function useNow(interval = 1000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

function formatTime(date: Date, tz: string) {
  return date.toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(date: Date, tz: string) {
  return date.toLocaleDateString("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" });
}

function CountdownDisplay({ target, now }: { target: Date; now: Date }) {
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="flex gap-3 justify-center">
      {[
        { val: days, label: "days" },
        { val: hours, label: "hrs" },
        { val: minutes, label: "min" },
        { val: seconds, label: "sec" },
      ].map(({ val, label }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-3xl font-bold font-serif text-primary">{String(val).padStart(2, "0")}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  );
}

const Index = () => {
  const now = useNow();
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const { paris, tashkent } = useWeather();

  const daysSinceMet = differenceInDays(now, MET_DATE);
  const daysSinceDating = differenceInDays(now, DATING_DATE);

  const parisCondition = paris ? getCondition(paris.weatherCode, paris.isDay) : null;
  const tashkentCondition = tashkent ? getCondition(tashkent.weatherCode, tashkent.isDay) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-neon-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-neon-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <Heart className="mx-auto h-8 w-8 text-primary fill-primary animate-pulse drop-shadow-[0_0_8px_hsl(330,100%,60%)]" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Us</h1>
          <p className="text-sm text-muted-foreground">Paris · Tashkent</p>
        </div>

        {/* Day counters */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card/70 backdrop-blur border-primary/20 shadow-[0_0_15px_-3px_hsl(330,100%,60%,0.15)]">
            <CardContent className="p-5 text-center space-y-1">
              <CalendarHeart className="mx-auto h-5 w-5 text-primary/70" />
              <p className="text-4xl font-bold font-serif text-foreground">{daysSinceMet}</p>
              <p className="text-xs text-muted-foreground">days since we met</p>
            </CardContent>
          </Card>
          <Card className="bg-card/70 backdrop-blur border-primary/20 shadow-[0_0_15px_-3px_hsl(330,100%,60%,0.15)]">
            <CardContent className="p-5 text-center space-y-1">
              <Heart className="mx-auto h-5 w-5 text-primary/70" />
              <p className="text-4xl font-bold font-serif text-foreground">{daysSinceDating}</p>
              <p className="text-xs text-muted-foreground">days together</p>
            </CardContent>
          </Card>
        </div>

        {/* Local times + weather */}
        <div className="grid grid-cols-1 gap-4">
          {/* Paris */}
          {parisCondition ? (
            <WeatherScene condition={parisCondition}>
              <CityCard
                city="Paris"
                tz={PARIS_TZ}
                now={now}
                temp={paris!.temperature}
                wind={paris!.windSpeed}
                conditionLabel={getConditionLabel(parisCondition)}
              />
            </WeatherScene>
          ) : (
            <Card className="bg-card/70 backdrop-blur border-primary/20 shadow-[0_0_15px_-3px_hsl(330,100%,60%,0.15)]">
              <CityCard city="Paris" tz={PARIS_TZ} now={now} />
            </Card>
          )}

          {/* Tashkent */}
          {tashkentCondition ? (
            <WeatherScene condition={tashkentCondition}>
              <CityCard
                city="Tashkent"
                tz={TASHKENT_TZ}
                now={now}
                temp={tashkent!.temperature}
                wind={tashkent!.windSpeed}
                conditionLabel={getConditionLabel(tashkentCondition)}
              />
            </WeatherScene>
          ) : (
            <Card className="bg-card/60 backdrop-blur border-border/50">
              <CityCard city="Tashkent" tz={TASHKENT_TZ} now={now} />
            </Card>
          )}
        </div>

        {/* Countdown */}
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="p-5 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-primary/70" />
              <span className="text-sm font-medium">Next time we meet</span>
            </div>
            {NEXT_MEETING ? (
              <CountdownDisplay target={NEXT_MEETING} now={now} />
            ) : (
              <p className="text-muted-foreground text-sm italic">Date not set yet — soon 💕</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Utility toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center">
        <AnimatePresence>
          {toolbarOpen && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="mb-2 flex gap-3 bg-card/90 backdrop-blur-lg border border-border/50 rounded-2xl px-5 py-3 shadow-lg"
            >
              {utilities.map((u) => {
                const isInternal = u.url.startsWith("/");
                const Wrapper = isInternal ? Link : "a";
                const linkProps = isInternal
                  ? { to: u.url }
                  : { href: u.url, target: "_blank", rel: "noopener noreferrer" };
                return (
                  <Wrapper
                    key={u.label}
                    {...(linkProps as any)}
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    <u.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{u.label}</span>
                  </Wrapper>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setToolbarOpen((o) => !o)}
          className="mb-4 rounded-full bg-card/80 backdrop-blur border border-border/50 shadow-md hover:bg-accent/50 h-11 w-11"
        >
          <motion.div animate={{ rotate: toolbarOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronUp className="h-5 w-5 text-primary" />
          </motion.div>
        </Button>
      </div>
    </div>
  );
};

function CityCard({
  city,
  tz,
  now,
  temp,
  wind,
  conditionLabel,
}: {
  city: string;
  tz: string;
  now: Date;
  temp?: number;
  wind?: number;
  conditionLabel?: string;
}) {
  return (
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary/70" />
            <span className="text-sm font-semibold">{city}</span>
          </div>
          {conditionLabel && (
            <p className="text-xs text-muted-foreground ml-6">{conditionLabel}</p>
          )}
          {temp !== undefined && (
            <div className="flex items-center gap-3 ml-6 mt-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Thermometer className="h-3 w-3" /> {temp}°C
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wind className="h-3 w-3" /> {wind} km/h
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-semibold tabular-nums">{formatTime(now, tz)}</p>
          <p className="text-xs text-muted-foreground">{formatDate(now, tz)}</p>
        </div>
      </div>
    </CardContent>
  );
}

export default Index;
