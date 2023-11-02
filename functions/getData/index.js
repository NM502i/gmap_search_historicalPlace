/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall} = require("firebase-functions/v2/https");
const {PubSub} = require('@google-cloud/pubsub');
const axios = require("axios")

const {Client} = require("@googlemaps/google-maps-services-js");
const {Language} = require("@googlemaps/google-maps-services-js");

const key = process.env.Place_Api_Key;

const client = new Client({});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.getPlaceData = onCall(async (request) => {

    const return_arr = [];
    const location = request.data.location;
	  const keyword_arr = [{name:"史跡",status:true},{name:"仏教寺院",status:request.data.set.shrine},{name:"神社",status:request.data.set.temple},{name:"彫刻",status:request.data.set.sculpture}];

    const old_id_arr = request.data.old_id;

    let placeData = [];

    for (let keyword of keyword_arr) {
      if(!keyword.status) {
        continue;
      }
      const params_data = {
        "key": key,
        "language": Language.ja,
        "keyword": keyword.name,
        "location": location,
        "radius": request.data.set.distance,
      }
      const return_arr = await allPlacesNearby(params_data);

      placeData = placeData.concat(return_arr);
    }
    
    for (let places of placeData) {
      console.log(location);
      const distance = await calculate_distance(location,places.geometry.location);
      if(distance > request.data.set.distance) {
        continue;
      }
      const distance_time = await getDirections_time(location,places.geometry.location);
      let update = false;
      let photo_reference = null;
      if(places.photos){
        photo_reference = await photoURL(places.photos[0].photo_reference);
      }
      if(old_id_arr.length > 0) {
        if(!old_id_arr.includes(places.place_id)){
          update = true;
        }
      } else if(old_id_arr.length === 0) {
          update = true;
      }
      
      return_arr.push({
        "id": places.place_id,
        "name": places.name,
        "address": places.vicinity,
        "photo_reference": photo_reference,
        "location": places.geometry.location,
        "distance": distance,
        "distance_time": distance_time,
        "rating_score": places.rating,
        "rating_number": places.user_ratings_total,
        "update":update 
      });
    }
  
    const compare = ( a, b ) => {
      var r = 0;
      if( a.distance < b.distance ){ r = -1; }
      else if( a.distance > b.distance ){ r = 1; }
      return r;
    }
  
    return_arr.sort( compare );

    const topicNameOrId = 'sample-pubsub';
    const data = request.instanceIdToken;

    if(data && request.data.notification) {
      const pubTest = await publishMessage(topicNameOrId, data);
    }

    return return_arr
});

const allPlacesNearby = (query, empty_arr = []) => {
  return client.placesNearby({params: query,timeout: 1000})
  .then(result => {
    const allResults = empty_arr.concat(result.data.results);
    const nextPageToken = result.data.next_page_token;
    if (nextPageToken) {
      return new Promise(resolve => setTimeout(resolve, 5000)).then(() => allPlacesNearby({
        "key": query.key,
        "language": query.language,
        "keyword": query.keyword,
        "location": query.location,
        "radius": query.radius,
        "pagetoken": nextPageToken
      }, allResults));
    }
    return allResults;
  })
  .catch((e) => {
    console.log(e);
    return e;
  });
};

const getDirections_time = (location,geometry) => {
  return new Promise(function (resolve, reject) {
    client
    .directions({
      params: {
        key: key,
        origin: location,
        destination: geometry,
        mode:'walking',
        language: 'ja',
      },
      timeout: 1000, // milliseconds
    })
    .then((r) => {
      resolve(r.data.routes[0].legs[0].duration.text);
    })
    .catch((e) => {
      reject(e);
    });
  });
};

function calculate_distance(geo01, geo02) {
  const R = Math.PI / 180;
  let lat1 = geo01.lat * R;
  let lng1 = geo01.lng * R;
  let lat2 = geo02.lat * R;
  let lng2 = geo02.lng * R;
  let total = 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
  return Math.round(total * 1000);
}

function haversine_distance(mk1, mk2) {
  var R = 3958.8; // Radius of the Earth in miles
  var rlat1 = mk1.lat * (Math.PI/180);
   // Convert degrees to radians
  var rlat2 = mk2.lat * (Math.PI/180);
   // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (mk2.lng-mk1.lng) 
              * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * R 
  * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)
  +Math.cos(rlat1)*Math.cos(rlat2)
  *Math.sin(difflon/2)*Math.sin(difflon/2)));

  //四捨五入
  var distance = Math.round( d * 1000 );

  return distance;
}

const photoURL = (reference) => {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${reference}&key=${key}`;
  return new Promise(function (resolve, reject) {
    axios.get(url).then(res => {
      resolve(res.request.res.responseUrl);
    }).catch(error => {
      reject(error);
    });
  });
};

async function publishMessage(topicNameOrId, data) {

    const pubSubClient = new PubSub();
    const dataBuffer = Buffer.from(data);
  
    try {
      const messageId = await pubSubClient
        .topic(topicNameOrId)
        .publishMessage({data: dataBuffer});
      console.log(`Message ${messageId} published.`);
    } catch (error) {
      console.error(`Received error while publishing: ${error.message}`);
      process.exitCode = 1;
    }

  }


  