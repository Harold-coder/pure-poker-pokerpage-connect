const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const connectionsTableName = process.env.CONNECTIONS_TABLE;

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    console.log("Hello!");

    // Optionally retrieve gameId and playerId from queryStringParameters
    const gameId = event.queryStringParameters ? event.queryStringParameters.gameId : null;
    const playerId = event.queryStringParameters ? event.queryStringParameters.playerId : null;

    console.log("gameId", gameId);
    console.log("playerId:", playerId);

    // Note: playerId = jwtToken
    if (!playerId) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Failed to connect, no jwt given.', action: 'connect' }) };
    }

    let userId = undefined;
    try {
        const res = await fetch(
          //error 500
          "https://oqqznkdgb3.execute-api.us-east-1.amazonaws.com/dev/validate_token",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${playerId}`,
            },
          }
        );
        console.log("Response:", res);
        if (res.status === 200) {
          const data = await res.json();
          userId = data.user.username;
        } else {
          return {
            statusCode: 500,
            body: JSON.stringify({
              message: "Failed to validate token",
              action: "poker-connect",
            }),
            headers: headerTemplate,
          };
        }
      } catch (err) {
        console.error("Error validating token:", err);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Failed to validate token",
            action: "poker-connect",
          }),
          headers: headerTemplate,
        };
      }

    const item = {
        connectionId: connectionId,
        // Only add gameId and playerId to the item if they are provided
        ...(gameId && { gameId: gameId }),
        ...(userId && { playerId: userId }),
    };

    console.log("Item:", item);

    try {
        await dynamoDb.put({ TableName: connectionsTableName, Item: item }).promise();
        return { statusCode: 200, body: JSON.stringify({ message: 'Connected.', action: 'connect' }) };
    } catch (err) {
        console.error('Error:', err);
        return { statusCode: 500, body: JSON.stringify({ message: 'Failed to connect', action: 'connect' }) };
    }
};