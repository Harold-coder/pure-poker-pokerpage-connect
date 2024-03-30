const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const connectionsTableName = process.env.CONNECTIONS_TABLE;

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    // Optionally retrieve gameId and playerId from queryStringParameters
    const gameId = event.queryStringParameters ? event.queryStringParameters.gameId : null;
    const playerId = event.queryStringParameters ? event.queryStringParameters.playerId : null;

    const item = {
        connectionId: connectionId,
        // Only add gameId and playerId to the item if they are provided
        ...(gameId && { gameId: gameId }),
        ...(playerId && { playerId: playerId }),
    };

    try {
        await dynamoDb.put({ TableName: connectionsTableName, Item: item }).promise();
        return { statusCode: 200, body: JSON.stringify({ message: 'Connected.', action: 'connect' }) };
    } catch (err) {
        console.error('Error:', err);
        return { statusCode: 500, body: JSON.stringify({ message: 'Failed to connect', action: 'connect' }) };
    }
};