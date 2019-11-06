// Load Environment Variables from the .env file
require('dotenv').config();
const superagent = require('superagent');

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
// - make an express app!
const app = express();
// - get the port on which to run the server
const PORT = process.env.PORT;
// - enable CORS
app.use(cors());

let latlngs;

// Api routes
app.get('/location', (request, response) => {
    try {
        const location = request.query.search;
        const result = getLatLng(location);
        response.status(200).json(result);
    }
    catch (err) {
        response.status(500).send('Sorry, something went wrong. Please try again');    
    }
});

app.get('/weather', (request, response) => {
    try {
        const weather = request.query.weather;
        const result = formatWeather(weather);
        response.status(200).json(result);
    }
    catch (err) {
        response.status(500).send('Sorry, something went wrong. Please try again');   
    }
});

const geoData = require('./data/geo.json');
const weatherData = require('./data/darksky.json');

function getLatLng(location) {
    if (location === 'bad location') {
        throw new Error();
    }
    return toLocation(geoData);
}

function toLocation(geoData) {
    const firstResult = geoData.results[0];
    const geometry = firstResult.geometry;

    return {
        formatted_query: firstResult.formatted_address,
        latitude: geometry.location.lat,
        longitude: geometry.location.lng
    };
}

function formatWeather() {
    return weatherData.daily.data.map(day => {
        return {
            forecast: day.summary,
            time: new Date(day.time * 1000).toDateString()
        };
    });
}
console.log(weatherData.daily.data);
formatWeather(weatherData);

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});

