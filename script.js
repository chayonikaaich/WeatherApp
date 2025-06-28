// WeatherAPI.com integration
const weatherApi = {
    key: '59247388115f46da924173259251006',
    baseUrl: 'https://api.weatherapi.com/v1/forecast.json'
};

// DOM elements
const cityElem = document.getElementById('city');
const mainWeatherIcon = document.getElementById('main-weather-icon');
const clockElem = document.getElementById('clock');
const dateElem = document.getElementById('date');
const tempElem = document.getElementById('temperature');
const feelsLikeElem = document.getElementById('feels-like');
const sunriseElem = document.getElementById('sunrise');
const sunsetElem = document.getElementById('sunset');
const weatherDescElem = document.getElementById('weather-desc');
const humidityElem = document.getElementById('humidity');
const windElem = document.getElementById('wind');
const pressureElem = document.getElementById('pressure');
const uvElem = document.getElementById('uv');
const fiveDayForecastElem = document.getElementById('five-day-forecast');
const hourlyForecastElem = document.getElementById('hourly-forecast');
const inputBox = document.getElementById('input-box');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const unitToggleBtn = document.getElementById('unit-toggle-btn');

// Utility functions
function pad(n) { return n < 10 ? '0' + n : n; }
function formatTime(dateStr) {
    const d = new Date(dateStr);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function getWeatherIcon(iconUrl) {
    return `<img src="${iconUrl}" alt="icon" style="vertical-align:middle;width:48px;">`;
}

// Live clock
function startClock(localtime) {
    function updateClock() {
        const now = new Date();
        clockElem.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

let currentUnit = 'C'; // Default unit

// Main search logic
async function searchCityWeather(city) {
    try {
        // Use WeatherAPI's temp_unit param for unit selection
        const unitParam = currentUnit === 'F' ? '&temp_unit=f' : '&temp_unit=c';
        const url = `${weatherApi.baseUrl}?key=${weatherApi.key}&q=${encodeURIComponent(city)}&days=5&aqi=no&alerts=no${unitParam}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log('WeatherAPI.com response:', data);
        if (data.error) {
            alert(data.error.message);
            return;
        }
        // Current weather
        cityElem.textContent = `${data.location.name}, ${data.location.region}, ${data.location.country}`;
        mainWeatherIcon.innerHTML = getWeatherIcon(data.current.condition.icon);
        dateElem.textContent = formatDate(data.location.localtime);
        tempElem.textContent = `${Math.round(currentUnit === 'F' ? data.current.temp_f : data.current.temp_c)}°${currentUnit}`;
        feelsLikeElem.textContent = `${Math.round(currentUnit === 'F' ? data.current.feelslike_f : data.current.feelslike_c)}°${currentUnit}`;
        sunriseElem.textContent = data.forecast.forecastday[0].astro.sunrise;
        sunsetElem.textContent = data.forecast.forecastday[0].astro.sunset;
        weatherDescElem.textContent = data.current.condition.text;
        humidityElem.textContent = data.current.humidity;
        windElem.textContent = data.current.wind_kph;
        pressureElem.textContent = data.current.pressure_mb;
        uvElem.textContent = data.current.uv;
        startClock(data.location.localtime);
        // 5-day forecast
        fiveDayForecastElem.innerHTML = '';
        data.forecast.forecastday.forEach(day => {
            fiveDayForecastElem.innerHTML += `
                <div class="forecast-item">
                    <span class="icon">${getWeatherIcon(day.day.condition.icon)}</span>
                    <span class="temp">${Math.round(currentUnit === 'F' ? day.day.avgtemp_f : day.day.avgtemp_c)}°${currentUnit}</span>
                    <span class="date">${formatDate(day.date)}</span>
                </div>
            `;
        });
        // Hourly forecast (next 5 slots from today)
        hourlyForecastElem.innerHTML = '';
        const hours = data.forecast.forecastday[0].hour;
        for (let i = 0; i < 5; i++) {
            const hour = hours[i * 3]; // every 3 hours
            if (!hour) break;
            hourlyForecastElem.innerHTML += `
                <div class="forecast-item">
                    <span class="time">${formatTime(hour.time)}</span>
                    <span class="icon">${getWeatherIcon(hour.condition.icon)}</span>
                    <span class="temp">${Math.round(currentUnit === 'F' ? hour.temp_f : hour.temp_c)}°${currentUnit}</span>
                    <span class="wind"><i class="fas fa-wind"></i> ${hour.wind_kph} km/h</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('An error occurred while fetching weather data. Please check the console for details.');
    }
}

// Event listeners
searchBtn.onclick = () => {
    if (inputBox.value.trim()) searchCityWeather(inputBox.value.trim());
};
inputBox.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && inputBox.value.trim()) {
        searchCityWeather(inputBox.value.trim());
    }
});
locationBtn.onclick = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const url = `${weatherApi.baseUrl}?key=${weatherApi.key}&q=${latitude},${longitude}&days=5&aqi=no&alerts=no`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.error) {
                searchCityWeather(data.location.name);
            }
        });
    } else {
        alert('Geolocation not supported');
    }
};

unitToggleBtn.onclick = () => {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    unitToggleBtn.classList.toggle('active', currentUnit === 'F');
    unitToggleBtn.textContent = currentUnit === 'C' ? '°C / °F' : '°F / °C';
    if (inputBox.value.trim()) {
        searchCityWeather(inputBox.value.trim());
    } else {
        searchCityWeather('Mumbai');
    }
};

// Default city on load
window.onload = () => {
    searchCityWeather('Mumbai');
};
