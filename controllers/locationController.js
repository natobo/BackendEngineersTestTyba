const { config } = require('../config/config');
const { Client } = require('@googlemaps/google-maps-services-js');
const axios = require('axios');

const getRestLatLng = (req, res, next) => {
  const { body } = req;
  const clientMap = new Client({});
  clientMap
    .placesNearby(
      {
        params: {
          locations: [{ lat: body.lat, lng: body.lng }],
          key: config.googleApiKey,
          type: "restaurant"
        },
        timeout: 1000, // milliseconds
      },
      axios
    )
    .then((r) => {
      res.sendStatus(200).json({ r });
    })
    .catch((e) => {
      console.error('Error api google', e);
      next(res.sendStatus(500));
    });
};

module.exports = {
  getRestLatLng,
};
