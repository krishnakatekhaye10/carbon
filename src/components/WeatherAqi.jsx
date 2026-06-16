import { useEffect, useState } from 'react';

export default function WeatherAqi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setTimeout(() => setError('Geolocation not supported'), 0);
      return;
    }

    setTimeout(() => setLoading(true), 0);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
      },
      () => {
        setError('Location permission denied');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;

    const { latitude, longitude } = coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=pm2_5,pm10&timezone=auto`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setWeather(data.current_weather || null);

        // Try to get latest hourly pm2_5/pm10 values
        if (data.hourly && data.hourly.time && data.hourly.pm2_5) {
          const times = data.hourly.time;
          const pm25 = data.hourly.pm2_5;
          const pm10 = data.hourly.pm10;
          if (times.length > 0) {
            const lastIdx = times.length - 1;
            setAqi({ pm2_5: pm25[lastIdx], pm10: pm10 ? pm10[lastIdx] : null });
          }
        }

        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch weather/air data');
        setLoading(false);
      });
  }, [coords]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-4 rounded-2xl shadow-sm text-xs">
      <h4 className="text-sm font-bold mb-2">Live Weather & AQI</h4>
      {loading && <div className="text-slate-500">Detecting location...</div>}
      {error && <div className="text-rose-500">{error}</div>}

      {!loading && !error && (
        <div className="space-y-2">
          {coords && (
            <div className="text-[11px] text-slate-500">Location: {coords.latitude.toFixed(3)}, {coords.longitude.toFixed(3)}</div>
          )}

          {weather ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{Math.round(weather.temperature)}°C</div>
                <div className="text-[11px] text-slate-500">Wind {Math.round(weather.windspeed)} km/h</div>
              </div>
              <div className="text-[12px] px-3 py-1 bg-slate-50 dark:bg-slate-800/20 rounded-full border border-slate-100 dark:border-slate-850">{weather.weathercode ?? '—'}</div>
            </div>
          ) : (
            <div className="text-slate-500">Weather not available</div>
          )}

          {aqi ? (
            <div className="mt-2">
              <div className="text-[11px] text-slate-500">PM2.5: <span className="font-semibold">{aqi.pm2_5}</span> µg/m³</div>
              {aqi.pm10 !== null && <div className="text-[11px] text-slate-500">PM10: <span className="font-semibold">{aqi.pm10}</span> µg/m³</div>}
            </div>
          ) : (
            <div className="text-slate-500">AQI not available</div>
          )}
        </div>
      )}
    </div>
  );
}
