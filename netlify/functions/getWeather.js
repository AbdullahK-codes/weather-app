// netlify/functions/getWeather.js

const fetch = require("node-fetch");

exports.handler = async function (event) {
  const API_KEY = process.env.WEATHER_API_KEY;

  const { city, lat, lon } = event.queryStringParameters;

  let currentURL = "";
  let forecastURL = "";

  if (city) {
    currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
  } else if (lat && lon) {
    currentURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required parameters." }),
    };
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentURL),
      fetch(forecastURL),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Weather data not found." }),
      };
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ current: currentData, forecast: forecastData }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error." }),
    };
  }
};
