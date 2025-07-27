document.addEventListener("DOMContentLoaded", function () {
  const cityInput = document.getElementById("city-input");
  const searchBtn = document.getElementById("search-btn");
  const locationBtn = document.getElementById("location-btn");
  const celsiusBtn = document.getElementById("celsius-btn");
  const fahrenheitBtn = document.getElementById("fahrenheit-btn");
  const loadingOverlay = document.getElementById("loading-overlay");
  const errorModal = document.getElementById("error-modal");
  const closeModal = document.querySelector(".close-modal");
  const errorMessage = document.getElementById("error-message");

  document.getElementById("current-year").textContent =
    new Date().getFullYear();

  let currentUnit = "celsius";
  let currentCity = "London";

  init();

  function init() {
    getWeatherData(currentCity);

    searchBtn.addEventListener("click", searchWeather);
    locationBtn.addEventListener("click", getLocationWeather);
    cityInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") searchWeather();
    });

    celsiusBtn.addEventListener("click", () => switchUnit("celsius"));
    fahrenheitBtn.addEventListener("click", () => switchUnit("fahrenheit"));

    closeModal.addEventListener("click", () => {
      errorModal.classList.remove("active");
    });

    errorModal.addEventListener("click", (e) => {
      if (e.target === errorModal) {
        errorModal.classList.remove("active");
      }
    });
  }

  function searchWeather() {
    const city = cityInput.value.trim();
    if (city) {
      currentCity = city;
      getWeatherData(city);
      cityInput.value = "";
    }
  }

  function getLocationWeather() {
    if (navigator.geolocation) {
      showLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeatherByCoords(latitude, longitude);
        },
        (error) => {
          showLoading(false);
          showError(
            "Unable to retrieve your location. Please try again or search for a city."
          );
        }
      );
    } else {
      showError("Geolocation is not supported by your browser.");
    }
  }

  async function getWeatherData(city) {
    showLoading(true);
    try {
      const response = await fetch(
        `/.netlify/functions/getWeather?city=${encodeURIComponent(city)}`
      );
      if (!response.ok) throw new Error("City not found");

      const data = await response.json();
      updateCurrentWeather(data.current);
      updateForecast(data.forecast);
      updateHourlyForecast(data.forecast);
      showLoading(false);
    } catch (error) {
      showLoading(false);
      showError(error.message);
    }
  }

  async function getWeatherByCoords(lat, lon) {
    showLoading(true);
    try {
      const response = await fetch(
        `/.netlify/functions/getWeather?lat=${lat}&lon=${lon}`
      );
      if (!response.ok) throw new Error("Location weather not found");

      const data = await response.json();
      currentCity = data.current.name;
      updateCurrentWeather(data.current);
      updateForecast(data.forecast);
      updateHourlyForecast(data.forecast);
      showLoading(false);
    } catch (error) {
      showLoading(false);
      showError(error.message);
    }
  }

  function updateCurrentWeather(data) {
    document.getElementById(
      "city-name"
    ).textContent = `${data.name}, ${data.sys.country}`;

    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    document.getElementById("current-date").textContent =
      now.toLocaleDateString("en-US", options);

    const tempC = Math.round(data.main.temp);
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const feelsLikeC = Math.round(data.main.feels_like);
    const feelsLikeF = Math.round((feelsLikeC * 9) / 5 + 32);

    document.getElementById("current-temp").textContent =
      currentUnit === "celsius" ? tempC : tempF;
    document.getElementById("feels-like").textContent =
      currentUnit === "celsius" ? `${feelsLikeC}°` : `${feelsLikeF}°`;

    const iconCode = data.weather[0].icon;
    document.getElementById(
      "weather-icon"
    ).src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("weather-icon").alt = data.weather[0].description;
    document.getElementById("weather-desc").textContent =
      data.weather[0].description;

    document.getElementById("humidity").textContent = `${data.main.humidity}%`;

    const windSpeedKmh = Math.round(data.wind.speed * 3.6);
    const windSpeedMph = Math.round(windSpeedKmh / 1.609);
    document.getElementById("wind-speed").textContent =
      currentUnit === "celsius"
        ? `${windSpeedKmh} km/h`
        : `${windSpeedMph} mph`;

    document.getElementById(
      "pressure"
    ).textContent = `${data.main.pressure} hPa`;
  }

  function updateForecast(data) {
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = "";

    const dailyForecasts = {};
    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });

      if (!dailyForecasts[day]) {
        dailyForecasts[day] = { temps: [], icons: [], descriptions: [] };
      }

      dailyForecasts[day].temps.push(item.main.temp);
      dailyForecasts[day].icons.push(item.weather[0].icon);
      dailyForecasts[day].descriptions.push(item.weather[0].description);
    });

    const days = Object.keys(dailyForecasts).slice(0, 5);
    days.forEach((day) => {
      const dayData = dailyForecasts[day];
      const avgTemp =
        dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length;
      const mostCommonIcon = getMostCommonValue(dayData.icons);
      const mostCommonDesc = getMostCommonValue(dayData.descriptions);

      const tempC = Math.round(avgTemp);
      const tempF = Math.round((tempC * 9) / 5 + 32);

      const forecastCard = document.createElement("div");
      forecastCard.className = "forecast-card";
      forecastCard.innerHTML = `
        <div class="forecast-day">${day}</div>
        <img class="forecast-icon" src="https://openweathermap.org/img/wn/${mostCommonIcon}@2x.png" alt="${mostCommonDesc}">
        <div class="forecast-temp">
          <span>${currentUnit === "celsius" ? tempC : tempF}°</span>
        </div>
      `;

      forecastContainer.appendChild(forecastCard);
    });
  }

  function updateHourlyForecast(data) {
    const hourlyContainer = document.getElementById("hourly-container");
    hourlyContainer.innerHTML = "";

    const hourlyData = data.list.slice(0, 8);
    hourlyData.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const time = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });

      const tempC = Math.round(item.main.temp);
      const tempF = Math.round((tempC * 9) / 5 + 32);

      const hourlyItem = document.createElement("div");
      hourlyItem.className = "hourly-item";
      hourlyItem.innerHTML = `
        <div class="hourly-time">${time}</div>
        <img class="hourly-icon" src="https://openweathermap.org/img/wn/${
          item.weather[0].icon
        }.png" alt="${item.weather[0].description}">
        <div class="hourly-temp">${
          currentUnit === "celsius" ? tempC : tempF
        }°</div>
      `;

      hourlyContainer.appendChild(hourlyItem);
    });
  }

  function switchUnit(unit) {
    if (unit === currentUnit) return;

    currentUnit = unit;
    celsiusBtn.classList.toggle("active", unit === "celsius");
    fahrenheitBtn.classList.toggle("active", unit === "fahrenheit");
    getWeatherData(currentCity);
  }

  function showLoading(show) {
    if (show) {
      loadingOverlay.classList.add("active");
    } else {
      loadingOverlay.classList.remove("active");
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.add("active");
  }

  function getMostCommonValue(arr) {
    const counts = {};
    arr.forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );
  }
});
