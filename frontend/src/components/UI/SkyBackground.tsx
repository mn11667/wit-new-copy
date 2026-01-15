import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  ThemeKey,
  resolveTheme,
  mapWeatherCondition,
  parseTimeStr,
  getFallbackTimeBucket
} from '../../services/weatherLogic';

type SkyTheme = {
  gradient: string;
  clouds: { opacityFront: number; opacityBack: number };
  sun: number;
  moon: number;
  stars: number;
  rain: number;
  snow: number;
};

// IMPROVED GRADIENTS: Much darker/richer "Day" modes to allow white text readability (Deep Sky / Polarized look)
const skyThemes: Record<ThemeKey, SkyTheme> = {
  'day-clear': {
    // Deep Azure/Royal Blue instead of pale blue
    gradient: 'linear-gradient(180deg, #024694 0%, #0d63bd 50%, #2f81d4 100%)',
    clouds: { opacityFront: 0.1, opacityBack: 0.06 },
    sun: 0.9,
    moon: 0,
    stars: 0,
    rain: 0,
    snow: 0,
  },
  'day-cloudy': {
    // Slate/Greyish Blue
    gradient: 'linear-gradient(180deg, #334155 0%, #475569 50%, #64748b 100%)',
    clouds: { opacityFront: 0.25, opacityBack: 0.15 },
    sun: 0.4, // dim sun (increased from 0.2 for visibility)
    moon: 0,
    stars: 0,
    rain: 0,
    snow: 0,
  },
  'day-rain': {
    gradient: 'linear-gradient(180deg, #1e293b 0%, #334155 50%, #475569 100%)',
    clouds: { opacityFront: 0.6, opacityBack: 0.5 },
    sun: 0,
    moon: 0,
    stars: 0,
    rain: 0.5,
    snow: 0,
  },
  'day-storm': {
    gradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    clouds: { opacityFront: 0.7, opacityBack: 0.6 },
    sun: 0,
    moon: 0,
    stars: 0,
    rain: 0.6,
    snow: 0,
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
  },
  'dusk-cloudy': {
    gradient: 'linear-gradient(180deg, #4c1d95 0%, #831843 50%, #9f1239 100%)',
    clouds: { opacityFront: 0.4, opacityBack: 0.3 },
    sun: 0.2,
    moon: 0,
    stars: 0.3,
    rain: 0,
    snow: 0,
  },
  'night-clear': {
    gradient: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
    clouds: { opacityFront: 0.08, opacityBack: 0.04 },
    sun: 0,
    moon: 1,
    stars: 1,
    rain: 0,
    snow: 0,
  },
  'night-cloudy': {
    gradient: 'linear-gradient(180deg, #020617 0%, #172033 50%, #1e293b 100%)',
    clouds: { opacityFront: 0.4, opacityBack: 0.3 },
    sun: 0,
    moon: 0.6, // visible through clouds
    stars: 0.5,
    rain: 0,
    snow: 0,
  },
  'night-rain': {
    gradient: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #172554 100%)',
    clouds: { opacityFront: 0.45, opacityBack: 0.35 },
    sun: 0,
    moon: 0.3,
    stars: 0.2,
    rain: 0.5,
    snow: 0,
  },
  'night-storm': {
    gradient: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #0f172a 100%)',
    clouds: { opacityFront: 0.6, opacityBack: 0.5 },
    sun: 0,
    moon: 0.2,
    stars: 0.1,
    rain: 0.7,
    snow: 0,
  },
  'snow-day': {
    gradient: 'linear-gradient(180deg, #1e3a8a 0%, #bfdbfe 100%)',
    clouds: { opacityFront: 0.4, opacityBack: 0.3 },
    sun: 0.3,
    moon: 0,
    stars: 0,
    rain: 0,
    snow: 0.5, // active snow
  },
  'snow-night': {
    gradient: 'linear-gradient(180deg, #020617 0%, #1e293b 100%)',
    clouds: { opacityFront: 0.3, opacityBack: 0.2 },
    sun: 0,
    moon: 0.5,
    stars: 0.5,
    rain: 0,
    snow: 0.5, // active snow
  },
};

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
const WEATHER_CITY = import.meta.env.VITE_WEATHER_CITY || 'Kathmandu';

const SkyBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<ThemeKey>('day-clear');

  // State for sunrise/sunset (minutes from midnight)
  // Defaults: Sunrise 06:00 (360), Sunset 18:00 (1080)
  const [solarCycle, setSolarCycle] = useState({
    sunrise: 360,
    sunset: 1080,
    hasRealData: false
  });

  const [celestialPos, setCelestialPos] = useState({
    sunX: 50, sunY: 120, // Hidden/Low default
    moonX: 50, moonY: 120
  });

  const applyTheme = useCallback((key: ThemeKey) => {
    const el = containerRef.current;
    if (!el) return;

    const t = skyThemes[key];
    if (!t) return;

    // Apply strict containment by setting properties on the ref, not root
    el.style.setProperty('--sky-gradient', t.gradient);
    el.style.setProperty('--sky-sun-opacity', t.sun.toString());
    el.style.setProperty('--sky-moon-opacity', t.moon.toString());
    el.style.setProperty('--sky-stars-opacity', t.stars.toString());
    el.style.setProperty('--sky-cloud-front-opacity', t.clouds.opacityFront.toString());
    el.style.setProperty('--sky-cloud-back-opacity', t.clouds.opacityBack.toString());
    el.style.setProperty('--sky-rain-opacity', t.rain.toString());
    el.style.setProperty('--sky-snow-opacity', t.snow.toString());
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Fetches weather and determines current Theme
  useEffect(() => {
    let mounted = true;

    const fetchWeather = async () => {
      if (!mounted) return;

      if (!WEATHER_API_KEY || !WEATHER_CITY) {
        setTheme(resolveTheme(getFallbackTimeBucket(), 'clear'));
        return;
      }

      try {
        // Prefer forecast.json to get astro data
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(WEATHER_CITY)}&days=1&aqi=no&alerts=no`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`WeatherAPI error: ${res.status}`);

        const data = await res.json();

        // Parsing Condition
        const condition = mapWeatherCondition(
          data?.current?.condition?.text,
          data?.current?.condition?.code
        );

        // Parsing Solar Cycle
        const astro = data?.forecast?.forecastday?.[0]?.astro;
        let sunrise = 360;
        let sunset = 1080;
        let hasRealData = false;

        if (astro) {
          const sr = parseTimeStr(astro.sunrise);
          const ss = parseTimeStr(astro.sunset);
          if (sr !== -1 && ss !== -1) {
            sunrise = sr;
            sunset = ss;
            hasRealData = true;
          }
        }

        if (mounted) {
          setSolarCycle({ sunrise, sunset, hasRealData });
        }

        // Determining Time Bucket logic based on real sunrise/sunset
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        let timeBucket = getFallbackTimeBucket(now);

        // If we have real solar data, refine the bucket
        if (hasRealData) {
          // Dawn = Sunrise - 60m to Sunrise + 60m? 
          // Or strictly: Night < Sunrise < Day < Sunset < Night
          // Visual logic:
          // Dawn: sunrise - 30 to sunrise + 60
          // Dusk: sunset - 60 to sunset + 60
          // Day: sunrise + 60 to sunset - 60
          // Night: else

          // Allow overlapping ranges or prioritize
          const dawnStart = sunrise - 45;
          const dawnEnd = sunrise + 60;

          const duskStart = sunset - 60;
          const duskEnd = sunset + 45;

          if (currentMins >= dawnStart && currentMins <= dawnEnd) timeBucket = 'dawn';
          else if (currentMins >= duskStart && currentMins <= duskEnd) timeBucket = 'dusk';
          else if (currentMins > dawnEnd && currentMins < duskStart) timeBucket = 'day';
          else timeBucket = 'night';
        }

        // Also respect API "is_day" as a hard override for Night vs Day if needed, 
        // but our calculated bucket is more granular (dawn/dusk).
        // Check if API says it's night but we think it's day (unlikely).

        setTheme(resolveTheme(timeBucket, condition));

      } catch (e) {
        console.warn('Weather fetch failed, utilizing fallback logic', e);
        // Fallback
        setTheme(resolveTheme(getFallbackTimeBucket(), 'clear'));
      }
    };

    fetchWeather();
    const timer = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // Update Celestial Positions (Sun/Moon)
  useEffect(() => {
    const updateCelestialPosition = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      const { sunrise, sunset } = solarCycle;

      // Calculate Day Length
      // If sunset < sunrise (e.g. polar), handle edge case? Assume normal day for now.
      const dayLength = sunset - sunrise;

      let sX = 50, sY = 150; // Sun Default (hidden)

      // Sun active from Sunrise to Sunset
      if (currentMins >= sunrise && currentMins <= sunset) {
        const progress = (currentMins - sunrise) / dayLength; // 0 to 1
        sX = 10 + (progress * 80); // 10% to 90%
        const arc = Math.sin(progress * Math.PI);
        sY = 90 - (arc * 70); // 90% -> 20% -> 90%
      }

      // Moon logic: Opposite of Sun roughly?
      // Simplified: Moon rises at sunset, sets at sunrise + 24h?
      // Actually moon phases vary widely, but for visual effect, let's keep it opposed to sun.
      // Moon active from Sunset to Sunrise (next day)

      let mX = 50, mY = 150; // Moon Default (hidden)

      // Normalizing time for night cycle
      // Night starts at sunset, ends at sunrise
      // If current time > sunset: progress = (curr - sunset) / (1440 - sunset + sunrise)
      // If current time < sunrise: progress = (curr + 1440 - sunset) / (1440 - sunset + sunrise)

      const minsInDay = 1440;
      const nightLength = minsInDay - dayLength;

      let nightProgress = -1;

      if (currentMins > sunset) {
        nightProgress = (currentMins - sunset) / nightLength;
      } else if (currentMins < sunrise) {
        nightProgress = (currentMins + minsInDay - sunset) / nightLength;
      }

      if (nightProgress >= 0 && nightProgress <= 1) {
        mX = 10 + (nightProgress * 80);
        const arc = Math.sin(nightProgress * Math.PI);
        mY = 90 - (arc * 70);
      }

      setCelestialPos({ sunX: sX, sunY: sY, moonX: mX, moonY: mY });
    };

    updateCelestialPosition();
    const timer = setInterval(updateCelestialPosition, 60 * 1000); // 1 min
    return () => clearInterval(timer);
  }, [solarCycle]); // Recalculate if solar cycle changes

  return (
    <div id="sky-background" ref={containerRef}>
      <div className="sky-gradient" />

      {/* Sun */}
      <div
        className="sun"
        style={{
          left: `${celestialPos.sunX}%`,
          top: `${celestialPos.sunY}%`,
          display: 'none' // Sun hidden, using 3D Earth instead
        }}
      >
        <div className="sun-core" />
      </div>

      {/* Moon - HIDDEN (using 3D moon instead) */}
      <div
        className="moon"
        style={{
          left: `${celestialPos.moonX}%`,
          top: `${celestialPos.moonY}%`,
          display: 'none' // Hide 2D moon, using 3D instead
        }}
      >
        <div className="moon-craters" />
      </div>

      <div className="stars" />
      <div className="cloud-layer slow" />
      <div className="cloud-layer fast" />
      <div className="rain" />
      <div className="snow" />
    </div>
  );
};

export default SkyBackground;
