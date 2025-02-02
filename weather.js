const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

// Your API key from OpenWeatherMap
const API_KEY = "f3ed2c6dd6cd1710f9bca3191264acae";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Initialize SQLite database
const db = new sqlite3.Database("./weather_data.db");

// Create a table for weather data
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS weather (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      temperature REAL,
      pressure INTEGER,
      humidity INTEGER
    )
  `);
});

// Function to fetch weather data from the API
async function fetchWeatherData(cityName) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: cityName,
        appid: API_KEY,
        units: "metric", // Use Celsius units
      },
    });
    return response.data; // Return the weather data
  } catch (error) {
    console.error("Error fetching weather data:", error.response?.data || error.message);
    throw error;
  }
}

// Function to validate the weather data
function validateWeatherData(data) {
  const requiredKeys = ["name", "main", "weather"];
  const mainKeys = ["temp", "pressure", "humidity"];

  // Check required top-level keys
  requiredKeys.forEach((key) => {
    if (!data[key]) {
      throw new Error(`Missing key in response: ${key}`);
    }
  });

  // Check nested keys in "main"
  mainKeys.forEach((key) => {
    if (!data.main[key]) {
      throw new Error(`Missing key in 'main': ${key}`);
    }
  });

  return true;
}

// Function to save the weather data to the database
function saveWeatherData(data) {
  const { name: city, main: { temp: temperature, pressure, humidity } } = data;

  db.run(
    `INSERT INTO weather (city, temperature, pressure, humidity) VALUES (?, ?, ?, ?)`,
    [city, temperature, pressure, humidity],
    function (err) {
      if (err) {
        console.error("Error saving data:", err.message);
      } else {
        console.log(`Weather data for ${city} saved successfully!`);
      }
    }
  );
}

// Function to fetch and display saved data from the database
function fetchSavedWeatherData() {
  db.all("SELECT * FROM weather", [], (err, rows) => {
    if (err) {
      console.error("Error retrieving data:", err.message);
    } else {
      console.log("Saved Weather Data:");
      console.log(rows);
    }
  });
}

// Main script to fetch, validate, save, and display weather data
const city = "Tokyo"; // Change this to any city you want
fetchWeatherData(city)
  .then((data) => {
    if (validateWeatherData(data)) {
      saveWeatherData(data);
      fetchSavedWeatherData();
    }
  })
  .catch((error) => console.error(error.message));