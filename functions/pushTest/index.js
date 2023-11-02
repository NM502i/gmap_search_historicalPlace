const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const messaging = require("firebase-admin/messaging");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.pushTest = onCall(async (request) => {

  console.log(admin);

  const registrationToken = request.instanceIdToken;

  console.log(registrationToken);

  const message = {
    "notification": {
        "title": "FCM Message",
        "body": "This is an FCM Messageですよんね"
    },
    token: registrationToken
  };

  console.log("one");

  messaging.getMessaging().send(message)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });

});

  