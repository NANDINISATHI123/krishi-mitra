import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { getRealForecast, getMockWeatherRisk } from '../../services/weatherService.ts';
import { cacheContent, getCachedContent } from '../../services/offlineService.ts';
import { WeatherRisk } from '../../types.ts';
import { SunIcon, RainIcon, CloudyIcon, ThunderstormIcon } from '../Icons.tsx';
import SkeletonLoader from '../SkeletonLoader.tsx';

const WeatherAlerts: React.FC = () => {
    const { t, language, isOnline } = useAppContext();
    const [weatherData, setWeatherData] = useState<any | null>(null);
    const [riskAlert, setRiskAlert] = useState<WeatherRisk | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadWeather = async () => {
            setLoading(true);
            setError('');

            // --- Step 1: Cache-First Strategy ---
            // Immediately try to load weather from the local cache to provide a fast, offline-first experience.
            try {
                const cachedData = await getCachedContent('weather_forecast');
                if (cachedData) {
                    setWeatherData(cachedData.forecast);
                    setRiskAlert(cachedData.risk);
                }
            } catch (e) {
                console.error("Failed to read weather from cache", e);
            } finally {
                // We've either loaded from cache or found nothing, so the initial blocking load is complete.
                setLoading(false);
            }

            // --- Step 2: Network Fetch (if online) ---
            // If the user is online, attempt to get a fresh forecast.
            if (isOnline) {
                if (!navigator.geolocation) {
                    setError(t('weather_location_error'));
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const forecast = await getRealForecast(latitude, longitude);
                            const risk = await getMockWeatherRisk(forecast.current, language);
                            
                            // Update the UI state with the fresh data.
                            setWeatherData(forecast);
                            setRiskAlert(risk);
                            setError(''); // Clear any old errors (e.g., a previous location failure).
                            
                            // Update the cache for future offline use.
                            await cacheContent('weather_forecast', { forecast, risk });

                        } catch (fetchError) {
                            console.error("Failed to fetch fresh weather data:", fetchError);
                            // If fetching fails but we have cached data, we don't need to show a blocking error.
                            // The user will just see the stale data.
                        }
                    },
                    (geoError) => {
                        console.error("Geolocation error:", geoError);
                        // Show a non-blocking error. The user will still see the cached data if it exists.
                        setError(t('weather_location_error'));
                    }
                );
            } else if (!weatherData) {
                // If offline and we failed to load from cache, show the offline error.
                setError(t('weather_unavailable_offline'));
            }
        };

        loadWeather();
    }, [isOnline, t, language]);


    const getWeatherIcon = (code: number, className: string = "w-10 h-10") => {
        if ([0, 1].includes(code)) return <SunIcon className={className} />;
        if ([2, 3, 45, 48].includes(code)) return <CloudyIcon className={className} />;
        if (code >= 51 && code <= 67) return <RainIcon className={className} />;
        if (code >= 80 && code <= 82) return <RainIcon className={className} />;
        if (code >= 95 && code <= 99) return <ThunderstormIcon className={className} />;
        return <CloudyIcon className={className} />; // Default
    };

    const riskColor = riskAlert?.severity === 'High' ? 'red' : riskAlert?.severity === 'Medium' ? 'yellow' : 'green';

    if (loading) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('weather_forecast')}</h1>
                 <SkeletonLoader className="h-64 mt-6" />
            </div>
        );
    }

    if (error && !weatherData) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('weather_forecast')}</h1>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <p className="text-lg text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!weatherData) {
         return (
             <div>
                <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('weather_forecast')}</h1>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <p className="text-lg text-gray-500">{t('weather_unavailable_offline')}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('weather_forecast')}</h1>
            
            {error && (
                 <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                    {error}
                </div>
            )}
            
            <div className="space-y-6">
                {/* AI Risk Alert */}
                {riskAlert && (
                    <div className={`border-l-4 p-4 rounded-r-lg bg-white dark:bg-gray-800 border-${riskColor}-500 shadow-md`}>
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            {t('ai_powered_risk_alert')}
                            <span className={`px-2 py-1 text-sm font-semibold rounded-full bg-${riskColor}-100 text-${riskColor}-800 dark:bg-${riskColor}-900/50 dark:text-${riskColor}-200`}>
                                {t('severity')}: {riskAlert.severity}
                            </span>
                        </h2>
                        <p className="text-base text-gray-700 dark:text-gray-300">
                            {language === 'te' ? riskAlert.prediction_te : riskAlert.prediction_en}
                        </p>
                    </div>
                )}
                
                {/* Current & Hourly Forecast */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Weather */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="font-semibold text-lg mb-4">Now</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {getWeatherIcon(weatherData.current.weather_code, "w-20 h-20 text-yellow-500")}
                                <div>
                                    <p className="text-5xl font-bold">{Math.round(weatherData.current.temperature_2m)}°C</p>
                                    <p className="text-gray-500 dark:text-gray-400">{weatherData.current.weather_description}</p>
                                </div>
                            </div>
                            <div className="text-right text-sm space-y-1">
                                <p>Humidity: {weatherData.current.relative_humidity_2m}%</p>
                                <p>Wind: {weatherData.current.wind_speed_10m} km/h</p>
                                <p>Pressure: {weatherData.current.surface_pressure} hPa</p>
                            </div>
                        </div>
                    </div>

                    {/* Hourly Forecast */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="font-semibold text-lg mb-4">{t('hourly_forecast')}</h3>
                        <div className="flex justify-between space-x-2 overflow-x-auto">
                            {weatherData.hourly.time.slice(0, 6).map((time: string, index: number) => (
                                <div key={time} className="text-center flex-shrink-0 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 w-20">
                                    <p className="text-sm font-semibold">{new Date(time).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}</p>
                                    {getWeatherIcon(weatherData.hourly.weather_code[index], "w-10 h-10 mx-auto my-1")}
                                    <p className="font-bold text-lg">{Math.round(weatherData.hourly.temperature_2m[index])}°C</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Daily Forecast */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold text-lg mb-4">{t('daily_forecast')}</h3>
                    <div className="space-y-3">
                        {weatherData.daily.time.map((date: string, index: number) => (
                            <div key={date} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <p className="font-semibold w-1/3">{new Date(date).toLocaleDateString(language, { weekday: 'long' })}</p>
                                <div className="w-1/3 flex justify-center">
                                    {getWeatherIcon(weatherData.daily.weather_code[index], "w-8 h-8")}
                                </div>
                                <p className="w-1/3 text-right">
                                    <span className="font-bold">{Math.round(weatherData.daily.temperature_2m_max[index])}°</span>
                                    <span className="text-gray-500"> / {Math.round(weatherData.daily.temperature_2m_min[index])}°</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherAlerts;