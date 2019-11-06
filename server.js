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

// let latlngs;

// Api routes
app.get('/location', async(request, response) => {
    try {
        const searchQuery = request.query.search;
        const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
        
        const locationItem = await superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${GEOCODE_API_KEY}`);
        
        const parsedLocation = JSON.parse(locationItem.text).results[0];
       console.log(parsedLocation)
        const formattedSearchResult = toLocation(parsedLocation);
        console.log(formattedSearchResult);

        response.status(200).json(formattedSearchResult);
    }
    catch (err) {
        response.status(500).send('Sorry, something went wrong. Please try again');    
    }
});

// app.get('/weather', (request, response) => {
//     try {
//         const weather = request.query.weather;
//         const result = formatWeather(weather);
//         response.status(200).json(result);
//     }
//     catch (err) {
//         response.status(500).send('Sorry, something went wrong. Please try again');   
//     }
// });


function toLocation(locationItem) {

    const geometry = locationItem.geometry;

    return {
        formatted_query: locationItem.formatted_address,
        latitude: geometry.location.lat,
        longitude: geometry.location.lng
    };
}

// function formatWeather() {
//     return weatherData.daily.data.map(day => {
//         return {
//             forecast: day.summary,
//             time: new Date(day.time * 1000).toDateString()
//         };
//     });
// }
// formatWeather(weatherData);

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});

