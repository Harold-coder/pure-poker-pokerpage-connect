const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const connectionsTable = process.env.CONNECTIONS_TABLE;

exports.handler = async (event) => {
    // Extract the connection ID provided by API Gateway
    const connectionId = event.requestContext.connectionId;

    // Extract the playerId and gameId from the query string parameters
    const queryStringParameters = event.queryStringParameters || {};
    const playerId = queryStringParameters.playerId;
    const gameId = queryStringParameters.gameId; // gameId may be undefined if creating a new game

    // Prepare the item to insert into the DynamoDB table
    const item = {
        connectionId,
        playerId,
        gameId, // This can be undefined, which is okay for new game creation scenarios
    };

    try {
        // Insert the item into the DynamoDB table
        await dynamoDb.put({ TableName: connectionsTable, Item: item }).promise();
        return { statusCode: 200, body: 'Connected.' };
    } catch (err) {
        console.error('Error saving connection:', err);
        return { statusCode: 500, body: 'Failed to connect' };
    }
};