// const awsIot = require("aws-iot-device-sdk");
// let connections;

// // Import connections after server initialization
// setTimeout(() => {
//   connections = require('./server').connections;
// }, 1000);

// // // AWS IoT Device Configuration
// // const device = awsIot.device({
// //   keyPath: "./cert/d963cd1faf2a812ee9a50f1257971e394cdb03d34b49e6f9d787e81fdd2630fa-private.pem.key",
// //   certPath: "./cert/d963cd1faf2a812ee9a50f1257971e394cdb03d34b49e6f9d787e81fdd2630fa-certificate.pem.crt",
// //   caPath: "./cert/AmazonRootCA1.pem",
// //   clientId: `myNodeSubscriber-${Date.now()}`,
// //   host: "a2cdp9hijgdiig-ats.iot.ap-southeast-2.amazonaws.com",
// // });
// // AWS IoT Device Configuration
// const device = awsIot.device({
//   keyPath:
//     "./cert/567ac5f9b0348408455bfc91506042fe17270e042a0499705711a24c5c7a6883-private.pem.key",
//   certPath:
//     "./cert/567ac5f9b0348408455bfc91506042fe17270e042a0499705711a24c5c7a6883-certificate.pem.crt",
//   caPath: "./cert/AmazonRootCA1.pem",
//   clientId: `myNodeSubscriber-${Date.now()}`,
//   host: "a2cdp9hijgdiig-ats.iot.ap-southeast-2.amazonaws.com",
// });


// // Set up MQTT connection handlers
// device.on('connect', () => {
//   console.log('Connected to AWS IoT MQTT');
//   device.subscribe('robot/connect');
//   console.log('Subscribed to robot/connect topic');
// });

// device.on('message', (topic, payload) => {
//   console.log('Received message:', topic);
//   if (topic === 'robot/connect') {
//     try {
//       const { robotId, idToken, timestamp } = JSON.parse(payload.toString());
      
//       // Check if we have an active WebSocket connection for this robot
//       if (connections && connections.has(robotId)) {
//         const ws = connections.get(robotId);
//         // Send the idToken to the robot interface
//         ws.send(JSON.stringify({
//           type: 'auth',
//           idToken,
//           timestamp
//         }));
//         console.log(`Sent auth token to robot: ${robotId}`);
//       } else {
//         console.log(`No active connection for robot: ${robotId}`);
//       }
//     } catch (error) {
//       console.error('Error parsing message:', error);
//     }
//   }
// });
