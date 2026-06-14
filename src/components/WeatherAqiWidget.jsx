import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Snowflake, 
  Wind, 
  MapPin, 
  Search, 
  Navigation, 
  Activity, 
  Info, 
  AlertTriangle, 
  RefreshCw, 
  Thermometer, 
  Droplets,
  ArrowRight
} from 'lucide-react';
import { useToast } from './ToastContext';

// Default fallback coordinates: New Delhi, India
const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.2090;
const DEFAULT_NAME = 'New Delhi, India';

/**
 * Map Open-Meteo weather codes to descriptive labels and Lucide Icons
 * @param {number} code - Weather code
 * @returns {{ label: string, Icon: any, emoji: string }}
 */
function getWeatherCondition(code) {
  if (code === 0) return { label: 'Clear Sky', Icon: Sun, emoji: '☀️' };
  if ([1, 2, 3].includes(code)) return { label: 'Partly Cloudy', Icon: CloudSun, emoji: '⛅' };
  if ([45, 48].includes(code)) return { label: 'Foggy', Icon: Cloud, emoji: '🌫️' };
  if ([51, 53, 55].includes(code)) return { label: 'Drizzle', Icon: CloudDrizzle, emoji: '🌧️' };
  if ([56, 57].includes(code)) return { label: 'Freezing Drizzle', Icon: Snowflake, emoji: '❄️' };
  if ([61, 63, 65].includes(code)) return { label: 'Rainy', Icon: CloudRain, emoji: '🌧️' };
  if ([66, 67].includes(code)) return { label: 'Freezing Rain', Icon: Snowflake, emoji: '❄️' };
  if ([71, 73, 75].includes(code)) return { label: 'Snowfall', Icon: Snowflake, emoji: '❄️' };
  if ([77].includes(code)) return { label: 'Snow Grains', Icon: Snowflake, emoji: '❄️' };
  if ([80, 81, 82].includes(code)) return { label: 'Rain Showers', Icon: CloudRain, emoji: '🌦️' };
  if ([85, 86].includes(code)) return { label: 'Snow Showers', Icon: Snowflake, emoji: '🌨️' };
  if ([95].includes(code)) return { label: 'Thunderstorm', Icon: CloudLightning, emoji: '🌩️' };
  if ([96, 99].includes(code)) return { label: 'Severe Thunderstorm', Icon: CloudLightning, emoji: '⛈️' };
  return { label: 'Unknown', Icon: CloudSun, emoji: '🌤️' };
}

/**
 * Map US AQI (0-500) to colors, health categories, and action plans
 * @param {number} aqi - US AQI score
 * @returns {{ category: string, color: string, advice: string, icon: any }}
 */
function getAqiDetails(aqi) {
  if (aqi <= 50) {
    return {
      category: 'Good',
      color: '#10b981', // Mint / Green
      advice: 'Air quality is satisfactory. Perfect day to cycle or walk to lower your carbon footprint! 🚲',
      icon: Activity
    };
  }
  if (aqi <= 100) {
    return {
      category: 'Moderate',
      color: '#f59e0b', // Amber / Yellow
      advice: 'Air quality is acceptable. Very low risk. A good day to walk or catch public transit! 🚌',
      icon: Activity
    };
  }
  if (aqi <= 150) {
    return {
      category: 'Unhealthy for Sensitive Groups',
      color: '#d97706', // Darker Amber / Orange
      advice: 'Sensitive individuals should limit prolonged outdoor exposure. Consider electric public transit.',
      icon: Info
    };
  }
  if (aqi <= 200) {
    return {
      category: 'Unhealthy',
      color: '#ef4444', // Red
      advice: 'Active adults and children should avoid heavy outdoor exertion. Wear a mask if walking outside.',
      icon: AlertTriangle
    };
  }
  if (aqi <= 300) {
    return {
      category: 'Very Unhealthy',
      color: '#8b5cf6', // Purple
      advice: 'Health alert: Everyone should reduce outdoor activity. Keep windows closed and use clean transit.',
      icon: AlertTriangle
    };
  }
  return {
    category: 'Hazardous',
    color: '#e11d48', // Crimson Rose
    advice: 'Emergency conditions: Stay indoors, seal windows, and avoid all unnecessary outdoor transit.',
    icon: AlertTriangle
  };
}

export default function WeatherAqiWidget() {
  const { addToast } = useToast();
  const watchIdRef = useRef(null);
  const permissionDeniedRef = useRef(false);
  const [isGpsLive, setIsGpsLive] = useState(false);
  
  // Coordinates and Location states
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lon, setLon] = useState(DEFAULT_LON);
  const [locationName, setLocationName] = useState(DEFAULT_NAME);
  
  // Weather & AQI states
  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  /**
   * Fetches weather and air quality datasets for specific coordinates
   * @param {number} latitude
   * @param {number} longitude
   */
  const fetchWeatherAndAqi = useCallback(async (latitude, longitude) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch live weather conditions from Open-Meteo Forecast API
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error('Failed to retrieve current weather forecast data.');
      const weatherJson = await weatherRes.json();
      
      // 2. Fetch live Air Quality datasets from Open-Meteo AQ API
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
      const aqiRes = await fetch(aqiUrl);
      if (!aqiRes.ok) throw new Error('Failed to retrieve real-time air quality metrics.');
      const aqiJson = await aqiRes.json();
      
      setWeatherData(weatherJson.current);
      setAqiData(aqiJson.current);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while loading regional weather data.');
      addToast('Error fetching weather data. Using cached/default values.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  /**
   * Reverse geocodes using OpenStreetMap's Nominatim (safe fallback, respects rate limits)
   * @param {number} latitude
   * @param {number} longitude
   */
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
      if (res.ok) {
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || 'Detected Location';
        const country = data.address.country || '';
        setLocationName(`${city}${country ? `, ${country}` : ''}`);
      } else {
        setLocationName(`Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
      }
    } catch (err) {
      console.debug('Reverse geocoding failed:', err);
      setLocationName(`Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
    }
  }, []);

  /**
   * Clears any active GPS tracking watch
   */
  const clearGpsWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /**
   * Requests geolocation from the browser (either one-shot or live tracking)
   * @param {boolean} watchLive - Whether to watch position changes live
   */
  const handleDetectLocation = useCallback((watchLive = false) => {
    if (!navigator.geolocation) {
      addToast('GPS Geolocation is not supported by your browser.', 'warning');
      return;
    }
    // If permission was previously denied, avoid re-requesting automatically
    if (permissionDeniedRef.current) {
      addToast('Location access has been denied. Please enable it in your browser to use live GPS.', 'warning');
      return;
    }
    
    setLoading(true);
    clearGpsWatch();

    const successCallback = async (position) => {
      const { latitude, longitude } = position.coords;
      setLat(latitude);
      setLon(longitude);
      await reverseGeocode(latitude, longitude);
      fetchWeatherAndAqi(latitude, longitude);
      if (watchLive) {
        addToast('Live GPS tracking active! 🛰️', 'success');
      } else {
        addToast('Location successfully updated! 🌍', 'success');
      }
    };

    const errorCallback = (err) => {
      // Some browsers provide a PositionError object with code/message
      const code = err && err.code ? err.code : null;
      const message = err && err.message ? err.message : '';
      console.warn('Geolocation failed:', code, message, err);

      // If permission was denied, remember it and avoid auto-retrying
      if (code === 1) {
        permissionDeniedRef.current = true;
        addToast('Location permission denied. Please enable location access in your browser settings.', 'warning');
      } else if (code === 2) {
        addToast('Unable to determine your location. Showing default coordinates.', 'info');
      } else if (code === 3) {
        addToast('Location request timed out. Using default coordinates.', 'info');
      } else {
        addToast('GPS connection failed. Displaying default coordinates.', 'info');
      }

      setIsGpsLive(false);
      setLat(DEFAULT_LAT);
      setLon(DEFAULT_LON);
      setLocationName(DEFAULT_NAME);
      fetchWeatherAndAqi(DEFAULT_LAT, DEFAULT_LON);
    };

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    if (watchLive) {
      setIsGpsLive(true);
      watchIdRef.current = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    } else {
      setIsGpsLive(false);
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    }
  }, [fetchWeatherAndAqi, reverseGeocode, clearGpsWatch, addToast]);

  // Initial load auto-trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDetectLocation(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [handleDetectLocation]);

  // Cleanup GPS watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  /**
   * Performs forward geocoding search for a city query
   * @param {string} query
   */
  const handleCitySearch = async (query) => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to connect to location directory.', 'error');
    }
  };

  /**
   * Selects a city from search results list
   * @param {object} city
   */
  const handleSelectCity = (city) => {
    clearGpsWatch();
    setIsGpsLive(false);
    const cityNameStr = `${city.name}, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country}`;
    setLocationName(cityNameStr);
    setLat(city.latitude);
    setLon(city.longitude);
    setSearchResults([]);
    setSearchQuery('');
    fetchWeatherAndAqi(city.latitude, city.longitude);
    addToast(`Displaying climate data for ${city.name} 🏙️`, 'success');
  };

  const weather = weatherData ? getWeatherCondition(weatherData.weather_code) : null;
  const WeatherIcon = weather ? weather.Icon : Sun;
  const aqi = aqiData ? getAqiDetails(aqiData.us_aqi) : null;
  const AqiIcon = aqi ? aqi.icon : Activity;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: 24, marginBottom: 28 }}>
      
      {/* Header and Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={20} color="var(--color-accent)" /> Local Climate Tracker
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Live location weather & Air Quality Index (AQI) with sustainable transit recommendation engines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flex: '1 1 auto', maxWidth: 450, position: 'relative' }}>
          {/* Search inputs */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="glass-input"
              placeholder="Search for any city..."
              style={{ width: '100%', paddingLeft: 38, paddingRight: 12, height: 38, fontSize: 13 }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  handleCitySearch(e.target.value);
                } else {
                  setSearchResults([]);
                }
              }}
            />

            {/* Floating Suggestions list */}
            {searchResults.length > 0 && (
              <div className="glass-card animate-scale-in" style={{
                position: 'absolute',
                top: 44,
                left: 0,
                right: 0,
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
                maxHeight: 220,
                overflowY: 'auto',
                padding: 6
              }}>
                {searchResults.map((city, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectCity(city)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{city.name}, {city.admin1 && `${city.admin1}, `}{city.country}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleDetectLocation(false)}
            className="btn-secondary"
            title="Auto-detect current location (once)"
            style={{ width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}
          >
            <MapPin size={16} />
          </button>

          <button
            onClick={() => {
              if (isGpsLive) {
                clearGpsWatch();
                setIsGpsLive(false);
                addToast('Live GPS tracking paused.', 'info');
              } else {
                handleDetectLocation(true);
              }
            }}
            className={isGpsLive ? "btn-primary" : "btn-secondary"}
            title="Toggle Live GPS Tracking"
            style={{
              height: 38,
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              borderRadius: 12,
              background: isGpsLive ? 'linear-gradient(135deg, #059669, #10b981)' : 'var(--bg-tertiary)',
              border: isGpsLive ? 'none' : '1px solid var(--border-color)',
              color: isGpsLive ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <Navigation size={15} className={isGpsLive ? "animate-pulse" : ""} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>
              {isGpsLive ? "Live" : "Live GPS"}
            </span>
            {isGpsLive && (
              <span style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'inline-block',
                animation: 'blink 1.2s infinite'
              }} />
            )}
          </button>
          
          <button
            onClick={() => fetchWeatherAndAqi(lat, lon)}
            className="btn-secondary"
            title="Refresh current metrics"
            disabled={loading}
            style={{ width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Geolocation Status display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Current Station:
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-accent)' }}>
          {locationName}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          ({lat.toFixed(4)}°N, {lon.toFixed(4)}°E)
        </span>
      </div>

      {loading ? (
        /* Loader Skeleton screen */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[1, 2].map(i => (
            <div key={i} className="glass-card" style={{ padding: 24, height: 220, display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(16,185,129,0.02)' }}>
              <div style={{ width: '40%', height: 16, borderRadius: 4, background: 'var(--bg-tertiary)' }} />
              <div style={{ width: '80%', height: 28, borderRadius: 6, background: 'var(--bg-tertiary)' }} />
              <div style={{ width: '60%', height: 14, borderRadius: 4, background: 'var(--bg-tertiary)' }} />
              <div style={{ flex: 1, display: 'flex', gap: 8, marginTop: 12 }}>
                {[1, 2, 3].map(j => (
                  <div key={j} style={{ flex: 1, height: 40, borderRadius: 8, background: 'var(--bg-tertiary)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error details screen */
        <div className="glass-card" style={{ padding: '24px 20px', borderLeft: '4px solid var(--color-rose)', background: 'rgba(225,29,72,0.05)', textAlign: 'center' }}>
          <AlertTriangle size={32} color="var(--color-rose)" />
          <h4 style={{ fontSize: 16, marginTop: 10, color: 'var(--text-primary)' }}>System Error</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{error}</p>
          <button className="btn-primary" onClick={handleDetectLocation} style={{ marginTop: 16, fontSize: 12, padding: '8px 16px' }}>
            Retry Location Connection
          </button>
        </div>
      ) : (
        /* Active Display Layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          {/* 1. Weather Information Card */}
          <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid var(--color-accent)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Local Weather
                </span>
                <span style={{ fontSize: 16 }}>{weather?.emoji}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <WeatherIcon size={28} />
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                    {weatherData.temperature_2m.toFixed(1)}°C
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {weather?.label}
                  </div>
                </div>
              </div>

              {/* Secondary weather indices */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Thermometer size={14} color="var(--color-sage)" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Apparent</span>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{weatherData.apparent_temperature.toFixed(1)}°C</span>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Droplets size={14} color="var(--color-sage)" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Humidity</span>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{weatherData.relative_humidity_2m}%</span>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wind size={14} color="var(--color-sage)" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Wind Speed</span>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{weatherData.wind_speed_10m} km/h</span>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>🌂</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Precipitation</span>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{weatherData.precipitation} mm</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
              💡 Weather influences HVAC heating/cooling demands, which dictate over 40% of home carbon footprints.
            </div>
          </div>

          {/* 2. Air Quality Index (AQI) Card */}
          <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `4px solid ${aqi?.color || 'var(--border-color)'}` }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Air Quality Index
                </span>
                <span className="carbon-badge" style={{ backgroundColor: `${aqi?.color}15`, color: aqi?.color, fontWeight: 800, fontSize: 11 }}>
                  {aqi?.category}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `${aqi?.color}10`,
                  color: aqi?.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AqiIcon size={28} />
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: aqi?.color, fontFamily: "'Outfit', sans-serif" }}>
                    {aqiData.us_aqi}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                    US EPA AQI Index (0 - 500)
                  </div>
                </div>
              </div>

              {/* Pollutant levels listing */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Key Air Pollutants:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: 'PM 2.5', val: aqiData.pm2_5, unit: 'µg/m³', max: 35 },
                    { label: 'PM 10', val: aqiData.pm10, unit: 'µg/m³', max: 150 },
                    { label: 'NO₂', val: aqiData.nitrogen_dioxide, unit: 'ppb', max: 100 },
                    { label: 'O₃ (Ozone)', val: aqiData.ozone, unit: 'ppb', max: 70 },
                    { label: 'CO', val: (aqiData.carbon_monoxide || 0).toFixed(0), unit: 'µg/m³', max: 9000 },
                    { label: 'SO₂', val: aqiData.sulphur_dioxide, unit: 'ppb', max: 75 }
                  ].map((p, idx) => {
                    const ratio = Math.min((p.val || 0) / p.max, 1.2);
                    const barColor = ratio > 1 ? 'var(--color-rose)' : ratio > 0.6 ? 'var(--color-amber)' : 'var(--color-accent)';
                    return (
                      <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>{p.val}</span>
                        <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{p.unit}</span>
                        {/* Miniature rating bar */}
                        <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(0,0,0,0.06)', marginTop: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(ratio * 100, 100)}%`, height: '100%', background: barColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
              🌿 High AQI prompts indoor isolation, boosting energy footprints, while cleaner AQI enables walking & biking.
            </div>
          </div>

          {/* 3. Sustainable Transit Advisory Card */}
          <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', background: 'var(--bg-tertiary)', border: `1.5px dashed ${aqi?.color || 'var(--color-accent)'}` }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: `${aqi?.color || '#10b981'}15`,
              color: aqi?.color || 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Activity size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="carbon-badge" style={{ backgroundColor: `${aqi?.color}20`, color: aqi?.color }}>
                  Eco-Transit Suggestion
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Climate advisory for current local weather conditions
                </span>
              </div>
              <h4 style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 6, lineHeight: 1.4 }}>
                {aqi?.advice}
              </h4>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button 
                className="btn-primary" 
                style={{ fontSize: 11, padding: '8px 16px', gap: 4 }}
                onClick={() => {
                  const scrollElement = document.getElementById('recycling-check');
                  if (scrollElement) {
                    scrollElement.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }
                }}
              >
                Log Travel Habits <ArrowRight size={12} />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Style overrides for spins */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: blink 1.2s infinite;
        }
      `}</style>
    </div>
  );
}
