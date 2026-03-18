import { useState, useEffect } from "react";

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
}

export type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "rainy" | "snowy" | "stormy" | "foggy" | "clear-night";

// WMO weather codes → simple conditions
export function getCondition(code: number, isDay: boolean): WeatherCondition {
  if (!isDay && code <= 1) return "clear-night";
  if (code <= 1) return "sunny";
  if (code <= 3) return "partly-cloudy";
  if (code <= 48) return code >= 45 ? "foggy" : "cloudy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "snowy";
  if (code <= 99) return "stormy";
  return "cloudy";
}

export function getConditionLabel(condition: WeatherCondition): string {
  const labels: Record<WeatherCondition, string> = {
    sunny: "Sunny",
    "partly-cloudy": "Partly Cloudy",
    cloudy: "Cloudy",
    rainy: "Rainy",
    snowy: "Snowy",
    stormy: "Stormy",
    foggy: "Foggy",
    "clear-night": "Clear Night",
  };
  return labels[condition];
}

const PARIS = { lat: 48.8566, lon: 2.3522 };
const TASHKENT = { lat: 41.2995, lon: 69.2401 };

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,is_day`
  );
  const data = await res.json();
  return {
    temperature: Math.round(data.current.temperature_2m),
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    isDay: data.current.is_day === 1,
  };
}

export function useWeather() {
  const [paris, setParis] = useState<WeatherData | null>(null);
  const [tashkent, setTashkent] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchWeather(PARIS.lat, PARIS.lon).then(setParis).catch(console.error);
    fetchWeather(TASHKENT.lat, TASHKENT.lon).then(setTashkent).catch(console.error);

    // Refresh every 15 min
    const id = setInterval(() => {
      fetchWeather(PARIS.lat, PARIS.lon).then(setParis).catch(console.error);
      fetchWeather(TASHKENT.lat, TASHKENT.lon).then(setTashkent).catch(console.error);
    }, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return { paris, tashkent };
}
