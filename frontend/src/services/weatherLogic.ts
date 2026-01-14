
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export type WeatherCondition =
    | 'clear'
    | 'cloudy'
    | 'rain'
    | 'storm'
    | 'snow'
    | 'fog';

export type ThemeKey =
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
    | 'snow-night';

/**
 * Fallback mapping for time of day when API data is missing.
 */
export const getFallbackTimeBucket = (date = new Date()): TimeOfDay => {
    const hour = date.getHours();
    // Simple heuristic:
    // Dawn: 05:00 - 08:00
    // Day: 08:00 - 17:00
    // Dusk: 17:00 - 20:00
    // Night: 20:00 - 05:00
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
};

/**
 * Maps WeatherAPI condition text/code to our internal WeatherCondition.
 * Deterministic mapping with strict priority.
 */
export const mapWeatherCondition = (text: string = '', code?: number): WeatherCondition => {
    const t = text.toLowerCase();

    // Priority 1: Hazardous/Intense weather
    if (t.includes('thunder') || t.includes('storm')) return 'storm';

    // Priority 2: Frozen precipitation
    if (t.includes('snow') || t.includes('blizzard') || t.includes('sleet') || t.includes('ice') || t.includes('hail')) return 'snow';

    // Priority 3: Rain
    if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return 'rain';

    // Priority 4: Low visibility
    if (t.includes('fog') || t.includes('mist') || t.includes('haze')) return 'fog';

    // Priority 5: Clouds
    if (t.includes('cloud') || t.includes('overcast')) return 'cloudy';

    // Fallback: Check explicitly by code ranges if text was ambiguous or missing
    if (code) {
        if (code >= 1273) return 'storm'; // Thundery outbreaks
        if (code >= 1198) return 'rain'; // Heavy rain/freezing rain
        if (code >= 1114) return 'snow'; // Blowing snow
        if (code >= 1003 && code <= 1009) return 'cloudy'; // Partial clouds to overcast
    }

    // Default
    return 'clear';
};

/**
 * purely functional resolver for visual theme based on time and condition.
 */
export const resolveTheme = (timeBucket: TimeOfDay, condition: WeatherCondition): ThemeKey => {
    // Snow overrides everything else because it's distinct visually
    if (condition === 'snow') {
        return timeBucket === 'night' ? 'snow-night' : 'snow-day';
    }

    // Heavy weather overrides time nuances (except night vs day)
    if (condition === 'storm') {
        return timeBucket === 'night' ? 'night-storm' : 'day-storm';
    }

    if (condition === 'rain') {
        return timeBucket === 'night' ? 'night-rain' : 'day-rain';
    }

    // Fog/Cloudy
    if (condition === 'fog' || condition === 'cloudy') {
        if (timeBucket === 'night') return 'night-cloudy';
        if (timeBucket === 'dusk' || timeBucket === 'dawn') return 'dusk-cloudy';
        return 'day-cloudy';
    }

    // Clear
    if (timeBucket === 'night') return 'night-clear';
    if (timeBucket === 'dusk' || timeBucket === 'dawn') return 'dusk-clear';

    return 'day-clear';
};

/**
 * Parses "06:00 AM" or "18:00" into minutes from midnight.
 * Returns -1 if invalid.
 */
export const parseTimeStr = (timeStr: string): number => {
    if (!timeStr) return -1;
    const clean = timeStr.toLowerCase().trim();
    const match = clean.match(/(\d+):(\d+)\s?(am|pm)?/);
    if (!match) return -1;

    let [_, hStr, mStr, meridian] = match;
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);

    if (meridian) {
        if (meridian === 'pm' && h < 12) h += 12;
        if (meridian === 'am' && h === 12) h = 0;
    }

    return h * 60 + m;
};

