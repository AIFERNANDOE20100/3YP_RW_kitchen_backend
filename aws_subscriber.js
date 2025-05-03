const awsIot = require("aws-iot-device-sdk");

// AWS IoT Device Configuration
const device = awsIot.device({
  keyPath: "./cert/d963cd1faf2a812ee9a50f1257971e394cdb03d34b49e6f9d787e81fdd2630fa-private.pem.key",
  certPath: "./cert/d963cd1faf2a812ee9a50f1257971e394cdb03d34b49e6f9d787e81fdd2630fa-certificate.pem.crt",
  caPath: "./cert/AmazonRootCA1.pem",
  clientId: `myNodeSubscriber-${Date.now()}`,
  host: "a2cdp9hijgdiig-ats.iot.ap-southeast-2.amazonaws.com",
});


// Connect to AWS IoT Core
device.on("connect", () => {
  console.log("Connected to AWS IoT Core");
});
