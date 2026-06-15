const MOCK_DATA = { location: 'San Francisco, CA', temperature: 19, aqi: 45, condition: 'Clear', advice: 'Air quality is excellent for outdoor activity.' };

export function WeatherAqiWidget() {
  return (
    <section className="weather-card glass-card">
      <span className="eyebrow">Live climate</span>
      <h2>{MOCK_DATA.location}</h2>
      <div className="weather-summary">
        <div>
          <span>{MOCK_DATA.temperature}°C</span>
          <p>{MOCK_DATA.condition}</p>
        </div>
        <div>
          <span>AQI {MOCK_DATA.aqi}</span>
          <p>{MOCK_DATA.advice}</p>
        </div>
      </div>
    </section>
  );
}
