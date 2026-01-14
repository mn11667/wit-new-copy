import React, { useEffect, useMemo, useState } from 'react';

type ThemeKey =
  | 'day-clear'
  | 'day-cloudy'
  | 'day-rain'
  | 'day-storm'
  | 'dusk-clear'
  | 'dusk-cloudy'
  | 'night-clear'
  | 'night-cloudy'
  | 'night-rain'
  | 'night-storm'
  | 'snow-day'
  | 'snow-night'
  | 'fog';

type SkyTheme = {
  gradient: string;
  clouds: { opacityFront: number; opacityBack: number };
  sun: number;
  moon: number;
  stars: number;
  rain: number;
  snow: number;
  fog: number;
};

// IMPROVED GRADIENTS: Much darker/richer "Day" modes to allow white text readability (Deep Sky / Polarized look)
const skyThemes: Record<ThemeKey, SkyTheme> = {
  'day-clear': {
    // Deep Azure/Royal Blue instead of pale blue
    gradient: 'linear-gradient(180deg, #024694 0%, #0d63bd 50%, #2f81d4 100%)',
    clouds: { opacityFront: 0.15, opacityBack: 0.1 },
    sun: 0.9,
    moon: 0,
    stars: 0,
    rain: 0,
    snow: 0,
    fog: 0,
  },
  'day-cloudy': {
    // Slate/Greyish Blue
    gradient: 'linear-gradient(180deg, #334155 0%, #475569 50%, #64748b 100%)',
    clouds: { opacityFront: 0.5, opacityBack: 0.35 },
    sun: 0.2, // dim sun
    moon: 0,
    stars: 0,
    rain: 0,
    snow: 0,
    fog: 0,
  },
  'day-rain': {
    gradient: 'linear-gradient(180deg, #1e293b 0%, #334155 50%, #475569 100%)',
    clouds: { opacityFront: 0.6, opacityBack: 0.5 },
    sun: 0,
    moon: 0,
    stars: 0,
    rain: 0.5,
    snow: 0,
    fog: 0.1,
  },
  'day-storm': {
    gradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    clouds: { opacityFront: 0.7, opacityBack: 0.6 },
    sun: 0,
    moon: 0,
    stars: 0,
    rain: 0.6,
    snow: 0,
    fog: 0.1,
  },
  'dusk-clear': {
    // Sunset: Purple/Deep Orange but kept dark enough at top
    gradient: 'linear-gradient(180deg, #4c1d95 0%, #9f1239 50%, #fb923c 100%)',
    clouds: { opacityFront: 0.15, opacityBack: 0.1 },
    sun: 0.5,
    moon: 0,
    stars: 0.3,
    rain: 0,
    snow: 0,
    fog: 0,
  },
  'dusk-cloudy': {
    gradient: 'linear-gradient(180deg, #4c1d95 0%, #831843 50%, #9f1239 100%)',
    clouds: { opacityFront: 0.4, opacityBack: 0.3 },
    sun: 0.2,
    moon: 0,
    stars: 0.3,
    rain: 0,
    snow: 0,
    fog: 0.05,
  },
  'night-clear': {
    gradient: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
    clouds: { opacityFront: 0.08, opacityBack: 0.04 },
    sun: 0,
    moon: 1,
    stars: 1,
    rain: 0,
    snow: 0,
    fog: 0,
  },
  'night-cloudy': {
    gradient: 'linear-gradient(180deg, #020617 0%, #172033 50%, #1e293b 100%)',
    clouds: { opacityFront: 0.4, opacityBack: 0.3 },
    sun: 0,
    moon: 0.6, // visible through clouds
    stars: 0.5,
    rain: 0,
    snow: 0,
    fog: 0.05,
  },
  'night-rain': {
    gradient: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #172554 100%)',
    clouds: { opacityFront: 0.45, opacityBack: 0.35 },
    sun: 0,
    moon: 0.3,
    stars: 0.2,
    rain: 0.5,
    snow: 0,
    fog: 0.1,
  },
  'night-storm': {
    gradient: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #0f172a 100%)',
    clouds: { opacityFront: 0.6, opacityBack: 0.5 },
    sun: 0,
    moon: 0.2,
    stars: 0.1,
    rain: 0.7,
    snow: 0,
    fog: 0.1,
  },
  'snow-day': {
    gradient: 'linear-gradient(180deg, #1e3a8a 0%, #bfdbfe 100%)',
    clouds: { opacityFront: 0.4, opacityBack: 0.3 },
    sun: 0.3,
    moon: 0,
    stars: 0,
    rain: 0,
    snow: 0.5, // active snow
    fog: 0.15,
  },
  'snow-night': {
    gradient: 'linear-gradient(180deg, #020617 0%, #1e293b 100%)',
    clouds: { opacityFront: 0.3, opacityBack: 0.2 },
    sun: 0,
    moon: 0.5,
    stars: 0.5,
    rain: 0,
    snow: 0.5, // active snow
    fog: 0.1,
  },
  fog: {
    gradient: 'linear-gradient(180deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
    clouds: { opacityFront: 0.3, opacityBack: 0.2 },
    sun: 0.2,
    moon: 0.1,
    stars: 0,
    rain: 0,
    snow: 0,
    fog: 0.6, // heavy fog
  },
};

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
// Default to London if no city is provided via env
const WEATHER_CITY = import.meta.env.VITE_WEATHER_CITY || 'London';

const getTimeBucket = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

// WeatherAPI condition mapper (Restored)
const mapWeatherApiCondition = (data: any) => {
  const text = (data?.current?.condition?.text || '').toLowerCase();
  const code = data?.current?.condition?.code;

  if (!text) return 'clear';
  if (text.includes('thunder')) return 'storm';
  if (text.includes('storm')) return 'storm';
  if (text.includes('rain') || text.includes('drizzle')) return 'rain';
  if (text.includes('snow') || text.includes('blizzard') || text.includes('sleet') || text.includes('ice')) return 'snow';
  if (text.includes('fog') || text.includes('mist') || text.includes('haze')) return 'fog';
  if (text.includes('cloud') || text.includes('overcast')) return 'cloudy';

  // extra safeguard via code groups (WeatherAPI codes)
  if (code >= 1003 && code <= 1009) return 'cloudy';
  if (code >= 1063 && code <= 1207) return 'rain';
  if (code >= 1210 && code <= 1237) return 'snow';
  if (code >= 1273 && code <= 1282) return 'storm';
  return 'clear';
};

const resolveTheme = (timeBucket: string, condition: string): ThemeKey => {
  if (condition === 'snow') return (timeBucket === 'night' ? 'snow-night' : 'snow-day');
  if (condition === 'fog') return 'fog';
  if (condition === 'rain') return (timeBucket === 'night' ? 'night-rain' : 'day-rain');
  if (condition === 'storm') return (timeBucket === 'night' ? 'night-storm' : 'day-storm');
  if (condition === 'cloudy') return (timeBucket === 'night' ? 'night-cloudy' : timeBucket === 'dusk' ? 'dusk-cloudy' : 'day-cloudy');
  if (timeBucket === 'dusk' || timeBucket === 'dawn') return condition === 'cloudy' ? 'dusk-cloudy' : 'dusk-clear';
  if (timeBucket === 'night') return 'night-clear';
  return 'day-clear';
};

const SkyBackground: React.FC = () => {
  const [theme, setTheme] = useState<ThemeKey>('day-clear');

  const applyTheme = useMemo(
    () => (key: ThemeKey) => {
      const root = document.documentElement;
      const t = skyThemes[key];
      if (!t) return;
      root.style.setProperty('--sky-gradient', t.gradient);
      root.style.setProperty('--sky-sun-opacity', t.sun.toString());
      root.style.setProperty('--sky-moon-opacity', t.moon.toString());
      root.style.setProperty('--sky-stars-opacity', t.stars.toString());
      root.style.setProperty('--sky-cloud-front-opacity', t.clouds.opacityFront.toString());
      root.style.setProperty('--sky-cloud-back-opacity', t.clouds.opacityBack.toString());
      root.style.setProperty('--sky-rain-opacity', t.rain.toString());
      root.style.setProperty('--sky-snow-opacity', t.snow.toString());
      root.style.setProperty('--sky-fog-opacity', t.fog.toString());
    },
    [],
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async () => {
      if (!mounted) return;

      if (!WEATHER_API_KEY || !WEATHER_CITY) {
        const timeBucket = getTimeBucket();
        setTheme(resolveTheme(timeBucket, 'clear'));
        return;
      }

      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(WEATHER_CITY)}`,
        );
        const data = await res.json();

        if (data.error) throw new Error(data.error?.message || 'WeatherAPI error');

        const condition = mapWeatherApiCondition(data);
        const apiBucket = data?.current?.is_day === 0 ? 'night' : undefined;
        const timeBucket = apiBucket || getTimeBucket();

        setTheme(resolveTheme(timeBucket, condition));
      } catch (e) {
        console.error('Weather fetch failed', e);
        // Fallback to time-based simple
        const tb = getTimeBucket();
        setTheme(resolveTheme(tb, 'clear'));
      }
    };

    fetchWeather();
    const timer = setInterval(fetchWeather, 15 * 60 * 1000); // 15 mins
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const [celestialPos, setCelestialPos] = useState({
    sunX: 50, sunY: 120, // Hidden/Low default
    moonX: 50, moonY: 120
  });

  useEffect(() => {
    const updateCelestialPosition = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const totalMinutes = hour * 60 + minute;

      // Sun: rises 6:00 (360m), sets 18:00 (1080m)
      let sX = 50, sY = 150; // Default off-screen bottom

      if (totalMinutes >= 360 && totalMinutes <= 1080) {
        const progress = (totalMinutes - 360) / 720; // 0 to 1
        sX = 10 + (progress * 80); // 10% to 90%
        // Parabola: sin(0..PI) -> 0..1..0
        const arc = Math.sin(progress * Math.PI);
        sY = 90 - (arc * 70); // 90% (horizon) -> 20% (zenith)
      }

      // Moon: rises 18:00, sets 6:00
      let adjMinutes = totalMinutes;
      if (adjMinutes < 360) adjMinutes += 1440; // Treat 00:00-06:00 as 24:00-30:00

      let mX = 50, mY = 150; // Default off-screen bottom

      // Range: 18:00 (1080) to 30:00 (1800)
      if (adjMinutes >= 1080 && adjMinutes <= 1800) {
        const progress = (adjMinutes - 1080) / 720;
        mX = 10 + (progress * 80);
        const arc = Math.sin(progress * Math.PI);
        mY = 90 - (arc * 70);
      }

      setCelestialPos({ sunX: sX, sunY: sY, moonX: mX, moonY: mY });
    };

    updateCelestialPosition();
    const timer = setInterval(updateCelestialPosition, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="sky-background">
      <div className="sky-gradient" />

      {/* Sun with Corona/Glow layers for 3D feel */}
      <div
        className="sun"
        style={{
          left: `${celestialPos.sunX}%`,
          top: `${celestialPos.sunY}%`,
          display: theme.includes('day') || theme.includes('dusk') ? 'block' : 'none'
        }}
      >
        <div className="sun-core" />
      </div>

      {/* Moon with 3D sphere effect */}
      <div
        className="moon"
        style={{
          left: `${celestialPos.moonX}%`,
          top: `${celestialPos.moonY}%`,
          display: theme.includes('night') || theme.includes('snow-night') || theme.includes('fog') ? 'block' : 'none'
        }}
      >
        <div className="moon-craters" />
      </div>

      <div className="stars" />
      <div className="cloud-layer slow" />
      <div className="cloud-layer fast" />
      <div className="rain" />
      <div className="snow" />
      <div className="fog" />
    </div>
  );
};

export default SkyBackground;
