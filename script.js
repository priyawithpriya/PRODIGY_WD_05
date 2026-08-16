const weather = document.getElementById("weather");
const cityInput = document.getElementById("cityInput");

async function getWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        weather.innerHTML = `<p class="error">Please enter a city name.</p>`;
        return;
    }

    weather.innerHTML = `<p>Loading weather...</p>`;

    try {
        // Find city coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results) {
            weather.innerHTML = `<p class="error">City not found.</p>`;
            return;
        }

        const location = geoData.results[0];

        await showWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country
        );

    } catch (error) {
        weather.innerHTML =
            `<p class="error">Something went wrong. Try again.</p>`;
    }
}


async function showWeather(latitude, longitude, city, country) {

    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );

    const data = await response.json();

    const current = data.current;

    weather.innerHTML = `
        <h2>📍 ${city}, ${country}</h2>

        <div class="weather-icon">
            ${getWeatherIcon(current.weather_code)}
        </div>

        <div class="temperature">
            ${current.temperature_2m}°C
        </div>

        <p><strong>Weather:</strong> ${getWeatherDescription(current.weather_code)}</p>

        <p>💧 <strong>Humidity:</strong> ${current.relative_humidity_2m}%</p>

        <p>💨 <strong>Wind Speed:</strong> ${current.wind_speed_10m} km/h</p>
    `;
}


// Get weather using current location
function getLocationWeather() {

    if (!navigator.geolocation) {
        weather.innerHTML =
            `<p class="error">Location is not supported by your browser.</p>`;
        return;
    }

    weather.innerHTML = `<p>Getting your location...</p>`;

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {
                await showWeather(
                    latitude,
                    longitude,
                    "Your Location",
                    ""
                );
            } catch (error) {
                weather.innerHTML =
                    `<p class="error">Unable to get weather.</p>`;
            }
        },

        () => {
            weather.innerHTML =
                `<p class="error">Location permission denied.</p>`;
        }
    );
}


// Weather descriptions
function getWeatherDescription(code) {

    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";

    return "Unknown";
}


// Weather icons
function getWeatherIcon(code) {

    if (code === 0) return "☀️";
    if (code >= 1 && code <= 3) return "🌤️";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌦️";
    if (code >= 95 && code <= 99) return "⛈️";

    return "🌤️";
}