const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const connectionsTableName = process.env.CONNECTIONS_TABLE;
const gameSessionsTableName = process.env.GAME_TABLE; // Make sure to set this in your environment variables

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const gameId = event.requestContext.gameId;
  const playerUsername = event.requestContext.playerUsername;

  // First, check if the gameId exists in the gameSessions table
  try {
    const gameSessionResponse = await dynamoDb.get({
      TableName: gameSessionsTableName,
      Key: { gameId: gameId },
    }).promise();

    // If the game session doesn't exist, return an error response
    if (!gameSessionResponse.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: "Game session not found." }) };
    }

    // If the game session exists, proceed to save the connection
    const item = {
      connectionId: connectionId,
      gameId: gameId,
      playerUsername: playerUsername, // You had playerUsername twice here
    };

    await dynamoDb.put({ TableName: connectionsTableName, Item: item }).promise();
    return { statusCode: 200, body: JSON.stringify({ message: 'Connected.' }) };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Failed to connect' }) };
  }
};
