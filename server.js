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


// eslint-disable-next-line no-unused-vars
let latlngs;

// Api routes
app.get('/location', async(request, response) => {
    try {
        const searchQuery = request.query.search;
        const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
        
        const locationItem = await superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${GEOCODE_API_KEY}`);
        
        const parsedLocation = JSON.parse(locationItem.text).results[0];
       
        const formattedSearchResult = toLocation(parsedLocation);
        latlngs = formattedSearchResult;
        
        response.status(200).json(formattedSearchResult);
    }
    catch (err) {
        response.status(500).send('Sorry, something went wrong. Please try again');    
    }
});

app.get('/weather', async(latlngs, res) => {
    try {
        const weatherObject = await getWeatherResponse(latlngs.query.latitude, latlngs.query.longitude);
        res.status(200).json(weatherObject);
    }
    catch (err) {
        res.status(500).send('Sorry, something went wrong. Please try again');   
    }
});

// app.get('/events', async(latlngs, res) => {
//     try {
//         const eventObject = await getEventResponse(latlngs.query.latitude, latlngs.query.longitude);
//         res.status(200).json(eventObject);
//     }
//     catch (err) {
//         res.status(500).send('Sorry, something went wrong. Please try again');   
//     }
// });

app.get('/reviews', async(latlngs, res) => {
    try {
        const yelpObject = await getYelpResponse(latlngs.query.latitude, latlngs.query.longitude);
        res.status(200).json(yelpObject);
    }
    catch (err) {
        res.status(500).send('Sorry, something went wrong. Please try again');   
    }
});

app.get('/trails', async(latlngs, res) => {
    try {
        const trailsObject = await getTrailsResponse(latlngs.query.latitude, latlngs.query.longitude);
        res.status(200).json(trailsObject);
    }
    catch (err) {
        res.status(500).send('Sorry, something went wrong. Please try again');   
    }
});


function toLocation(locationItem) {

    const geometry = locationItem.geometry;

    return {
        formatted_query: locationItem.formatted_address,
        latitude: geometry.location.lat,
        longitude: geometry.location.lng
    };
}



const getWeatherResponse = async(lat, lng) => {
    const weatherData = await superagent.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lng}`);
    const parsedWeatherData = JSON.parse(weatherData.text);
    return parsedWeatherData.daily.data.map(day => {
        return {
            forecast: day.summary,
            time: new Date(day.time * 1000).toDateString()
        };
    });
};


const getYelpResponse = async(lat, lng) => {
    const yelpData = await superagent.get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}`).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`);
    
    const parsedYelpData = JSON.parse(yelpData.text);
    return parsedYelpData.businesses.map(review => {
        return {
            name: review.name,
            image_url: review.image_url,
            price: review.price,
            rating: review.rating,
            url: review.url
        };
    });
};

const getTrailsResponse = async(lat, lng) => {
    const trailData = await superagent.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lng}&maxDistance=200&key=${process.env.TRAIL_API_KEY}`);
    const parsedTrailData = JSON.parse(trailData.text);
    return parsedTrailData.trails.map(trail => {
        return {
            name: trail.name,
            location: trail.location,
            length: trail.length,
            stars: trail.stars,
            stars_votes: trail.starVotes,
            summary: trail.summary,
            trail_url: trail.url,
            conditions: trail.conditionStatus,
            condition_date: trail.conditionDate,
        };
    });
};

// `https://www.eventbriteapi.com/v3/events/search?location.latitude=45&location.longitude=122token=XOAVNIEIS46YDPNZL6`

// https://www.eventbriteapi.com/v3/events/search?token=BKI2EPP5P2KJAKC2TMZN&location.latitude=45&location.longitude=$122

// const getEventResponse = async(lat, lng) => {
//     const eventData = await superagent.get(`https://www.eventbriteapi.com/v3/events/search?token=${api-key}&location.latitude=${lat}&location.longitude=${lng}`);
//     const parsedEventData = JSON.parse(eventData.text);
//     return parsedEventData.daily.data.map(event => {
//         return {
//             forecast: event.summary,
//             time: new Date(event.time * 1000).toDateString()
//         };
//     });
// };

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});

