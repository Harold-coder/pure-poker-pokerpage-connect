// index.js
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.CONNECTIONS_TABLE;

exports.handler = async (event) => {
  const gameID = event.requestContext.gameID;

  const item = {
    gameID: gameID,
    // Additional attributes can be added here based on your game logic
  };

  try {
    await dynamoDb.put({ TableName: tableName, Item: item }).promise();
    return { statusCode: 200, body: 'Connected.' };
  } catch (err) {
    console.error('Error saving connection:', err);
    return { statusCode: 500, body: 'Failed to connect' };
  }
};
