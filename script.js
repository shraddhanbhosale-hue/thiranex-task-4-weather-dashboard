const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const weatherCard = document.getElementById("weather-card");

const cityName = document.getElementById("city-name");
const countryName = document.getElementById("country-name");

const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const weatherDescription =
    document.getElementById("weather-description");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const feelsLike = document.getElementById("feels-like");
const windDirection =
    document.getElementById("wind-direction");

const updatedTime =
    document.getElementById("updated-time");


const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";


const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


const weatherCodes = {
    0: {
        description: "Clear Sky",
        icon: "☀️"
    },

    1: {
        description: "Mainly Clear",
        icon: "🌤️"
    },

    2: {
        description: "Partly Cloudy",
        icon: "⛅"
    },

    3: {
        description: "Overcast",
        icon: "☁️"
    },

    45: {
        description: "Fog",
        icon: "🌫️"
    },

    48: {
        description: "Depositing Rime Fog",
        icon: "🌫️"
    },

    51: {
        description: "Light Drizzle",
        icon: "🌦️"
    },

    53: {
        description: "Moderate Drizzle",
        icon: "🌦️"
    },

    55: {
        description: "Dense Drizzle",
        icon: "🌧️"
    },

    61: {
        description: "Slight Rain",
        icon: "🌦️"
    },

    63: {
        description: "Moderate Rain",
        icon: "🌧️"
    },

    65: {
        description: "Heavy Rain",
        icon: "🌧️"
    },

    71: {
        description: "Slight Snow",
        icon: "🌨️"
    },

    73: {
        description: "Moderate Snow",
        icon: "❄️"
    },

    75: {
        description: "Heavy Snow",
        icon: "❄️"
    },

    77: {
        description: "Snow Grains",
        icon: "🌨️"
    },

    80: {
        description: "Slight Rain Showers",
        icon: "🌦️"
    },

    81: {
        description: "Moderate Rain Showers",
        icon: "🌧️"
    },

    82: {
        description: "Violent Rain Showers",
        icon: "⛈️"
    },

    85: {
        description: "Slight Snow Showers",
        icon: "🌨️"
    },

    86: {
        description: "Heavy Snow Showers",
        icon: "❄️"
    },

    95: {
        description: "Thunderstorm",
        icon: "⛈️"
    },

    96: {
        description: "Thunderstorm with Hail",
        icon: "⛈️"
    },

    99: {
        description: "Thunderstorm with Heavy Hail",
        icon: "⛈️"
    }
};


weatherForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const city = cityInput.value.trim();

        if (!city) {
            showError(
                "Please enter a city name."
            );

            cityInput.focus();

            return;
        }

        await getWeather(city);
    }
);


async function getWeather(city) {

    setLoading(true);

    hideError();

    weatherCard.classList.add("hidden");


    try {

        const location =
            await getCoordinates(city);


        const weather =
            await getWeatherData(
                location.latitude,
                location.longitude
            );


        displayWeather(
            location,
            weather
        );

    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to fetch weather data. Please try again."
        );

    } finally {

        setLoading(false);
    }
}


async function getCoordinates(city) {

    const url =
        `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;


    const response =
        await fetch(url);


    if (!response.ok) {
        throw new Error(
            "Unable to connect to the location service."
        );
    }


    const data =
        await response.json();


    if (
        !data.results ||
        data.results.length === 0
    ) {
        throw new Error(
            `City "${city}" was not found. Please check the spelling.`
        );
    }


    return data.results[0];
}


async function getWeatherData(
    latitude,
    longitude
) {

    const url =
        `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;


    const response =
        await fetch(url);


    if (!response.ok) {
        throw new Error(
            "Unable to retrieve weather information."
        );
    }


    const data =
        await response.json();


    if (!data.current) {
        throw new Error(
            "Weather information is currently unavailable."
        );
    }


    return data;
}


function displayWeather(
    location,
    data
) {

    const current =
        data.current;


    const weatherInfo =
        weatherCodes[current.weather_code] ||
        {
            description: "Unknown",
            icon: "🌡️"
        };


    cityName.textContent =
        location.name;


    countryName.textContent =
        `${location.country || ""}`;


    temperature.textContent =
        Math.round(current.temperature_2m);


    weatherIcon.textContent =
        weatherInfo.icon;


    weatherDescription.textContent =
        weatherInfo.description;


    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    windSpeed.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;


    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;


    windDirection.textContent =
        `${Math.round(current.wind_direction_10m)}°`;


    updatedTime.textContent =
        `Last updated: ${formatDateTime(current.time)}`;


    weatherCard.classList.remove("hidden");
}


function formatDateTime(dateString) {

    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


function setLoading(isLoading) {

    if (isLoading) {

        loading.classList.remove("hidden");

        searchButton.disabled = true;

        searchButton.textContent =
            "Searching...";

    } else {

        loading.classList.add("hidden");

        searchButton.disabled = false;

        searchButton.textContent =
            "Search";
    }
}


function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );

    weatherCard.classList.add(
        "hidden"
    );
}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );

    errorMessage.textContent = "";
}


cityInput.focus();