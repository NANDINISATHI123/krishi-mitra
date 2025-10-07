// Simulate a network delay
import { WeatherRisk } from '../types.ts';
import { Language } from '../lib/translations.ts';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const W_CODE: { [key: number]: string } = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Dense freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Heavy freezing rain",
    71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
};


export const getRealForecast = async (latitude: number, longitude: number) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,surface_pressure,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch weather data");
    }
    const data = await response.json();

    // Transform the Open-Meteo data to match our app's expected structure
    const transformed = {
        current: {
            ...data.current,
            weather_description: W_CODE[data.current.weather_code] || 'Unknown',
        },
        hourly: {
            ...data.hourly,
            weather_descriptions: data.hourly.weather_code.map((code: number) => W_CODE[code] || 'Unknown')
        },
        daily: {
            ...data.daily,
            weather_descriptions: data.daily.weather_code.map((code: number) => W_CODE[code] || 'Unknown')
        }
    };
    return transformed;
};

// Simulate Gemini predicting risk based on weather
export const getMockWeatherRisk = async (weatherData: any, lang: Language): Promise<WeatherRisk> => {
    await delay(500);
    const humidity = weatherData.relative_humidity_2m;
    const temp = weatherData.temperature_2m;
    const windSpeed = weatherData.wind_speed_10m;

    if (humidity > 80 && temp > 25) {
        return {
            severity: 'High',
            prediction_en: "High humidity and warm temperatures create a critical risk for fungal diseases like leaf blight and powdery mildew, especially for tomato and potato crops. Immediate proactive spraying with a copper-based organic fungicide or a Bordeaux mixture is advised. Improve air circulation by pruning lower leaves and monitor crops twice daily for early signs of infection.",
            prediction_te: "అధిక తేమ మరియు వెచ్చని ఉష్ణోగ్రతలు ఆకు మచ్చ మరియు బూజు తెగులు వంటి శిలీంధ్ర వ్యాధులకు, ముఖ్యంగా టమోటా మరియు బంగాళాదుంప పంటలకు, తీవ్రమైన ప్రమాదాన్ని సృష్టిస్తాయి. రాగి ఆధారిత సేంద్రియ శిలీంద్రనాశకంతో లేదా బోర్డో మిశ్రమంతో వెంటనే ముందుజాగ్రత్తగా పిచికారీ చేయడం మంచిది. దిగువ ఆకులను కత్తిరించడం ద్వారా గాలి ప్రసరణను మెరుగుపరచండి మరియు సంక్రమణ యొక్క ప్రారంభ సంకేతాల కోసం పంటలను రోజుకు రెండుసార్లు పర్యవేక్షించండి."
        };
    } else if (humidity > 70 && windSpeed > 18) { // wind speed in km/h
        return {
            severity: 'Medium',
            prediction_en: "Moderate humidity with windy conditions can cause rapid spread of pests like aphids, whiteflies, and thrips. We recommend applying a neem oil solution, focusing on the underside of leaves, as a preventative measure. Also, consider setting up yellow sticky traps to monitor pest populations.",
            prediction_te: "తేమతో కూడిన గాలులు అఫిడ్స్, వైట్‌ఫ్లైస్ మరియు థ్రిప్స్ వంటి పురుగుల వేగవంతమైన వ్యాప్తికి కారణమవుతాయి. నివారణ చర్యగా వేప నూనె ద్రావణాన్ని, ముఖ్యంగా ఆకుల దిగువ భాగంలో, పిచికారీ చేయాలని మేము సిఫార్సు చేస్తున్నాము. పురుగుల జనాభాను పర్యవేక్షించడానికి పసుపు జిగురు ట్రాప్‌లను ఏర్పాటు చేయడాన్ని కూడా పరిగణించండి."
        };
    } else {
        return {
            severity: 'Low',
            prediction_en: "Current weather conditions are favorable. The risk of disease or significant pest outbreak is low. Continue with standard watering and soil management. This is an ideal time for transplanting seedlings or applying compost to enrich the soil.",
            prediction_te: "ప్రస్తుత వాతావరణ పరిస్థితులు అనుకూలంగా ఉన్నాయి. వ్యాధి లేదా పురుగుల ముప్పు తక్కువగా ఉంది. సాధారణ నీటిపారుదల మరియు నేల యాజమాన్యాన్ని కొనసాగించండి. ఇది మొక్కలను నాటడానికి లేదా నేలను సుసంపన్నం చేయడానికి కంపోస్ట్ వేయడానికి అనువైన సమయం."
        };
    }
};