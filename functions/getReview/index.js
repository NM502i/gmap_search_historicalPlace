/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall} = require("firebase-functions/v2/https");

const {Client} = require("@googlemaps/google-maps-services-js");

const key = process.env.Place_Api_Key;

const client = new Client({});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.getReview = onCall(async (request) => {

  const params = {
    place_id: request.data.place_id,
    key: key,
    language: 'ja',
  };
  const r = await client.placeDetails({ params: params });

  const review_arr = [];

  if(r.data.result.reviews) {
    r.data.result.reviews.forEach((review, index) => {
      review_arr.push({
        "id": index,
        "author_name":review.author_name,
        "photo":review.profile_photo_url,
        "rating":review.rating,
        "text":review.text,
        "time":timestampToTime(review.time)
      });
    })
  }

  return review_arr
     
});


const timestampToTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const yyyy = `${date.getFullYear()}`;
  const MM = `0${date.getMonth() + 1}`.slice(-2);
  const dd = `0${date.getDate()}`.slice(-2);
  const HH = `0${date.getHours()}`.slice(-2);
  const mm = `0${date.getMinutes()}`.slice(-2);
  const ss = `0${date.getSeconds()}`.slice(-2);

  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
}