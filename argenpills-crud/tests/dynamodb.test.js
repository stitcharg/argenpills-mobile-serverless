const { DynamoDBClient, PutItemCommand, GetItemCommand, ListTablesCommand, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' }); // set your AWS region

describe("DynamoDB Integration Tests", () => {

  beforeAll(async () => {
    // Setup code, if needed.
    // Populate the table with test data
  });

  afterAll(async () => {
    // Teardown code, if needed.
    // Cleanup the table
  });


     it("should return 1", async () => {
      return true;   
     });

  // it("displays all tables", async() => {
  //   const run = async () => {
  //       const command = new ListTablesCommand({});
  //       try {
  //         const results = await client.send(command);
  //         console.log("Tables:", results.TableNames);
  //       } catch (err) {
  //         console.error(err);
  //       }
  //     };
      
  //     await run();
  // });

//   it("should put and get an item", async () => {
//     const putParams = {
//       TableName: 'sarasa',
//       Item: marshall({
//         id: '1',
//         name: 'John'
//       })
//     };

//     await client.send(new PutItemCommand(putParams));

//     const getParams = {
//       TableName: 'sarasa',
//       Key: marshall({
//         id: '1'
//       })
//     };

//     const { Item } = await client.send(new GetItemCommand(getParams));
//     const unmarshalledItem = unmarshall(Item);

//     expect(unmarshalledItem.id).toBe('1');
//     expect(unmarshalledItem.name).toBe('John');
//   });


  // it("should scan", async () => {

  //   const AP_TABLE = "argenpills-pills-8c4b3e0";
  //   const command = new ScanCommand({
  //       TableName: AP_TABLE,
  //       Limit: 100  // limit the number of items returned to 100
  //     });

  //     const results = await client.send(command);

  //     console.log(results);
  // });

  // it("should return something", async () => {

  //   const AP_TABLE = "argenpills-pills-8c4b3e0";

  //   const params = {
  //       TableName: AP_TABLE,
  //       IndexName: "published-posted_date-index",
  //       KeyConditionExpression: "#published = :published",
  //       ExpressionAttributeNames: {
  //         '#published': 'published' 
  //       },	
  //       ExpressionAttributeValues: {
  //         ":published": {S: 'x' } 
  //       },
  //       ScanIndexForward: false
  //   };    

  //   const results = await client.send(new QueryCommand(params));
  //   console.log("RESULTS", JSON.stringify(results));
  //   const Items = results.Items;
  //   const unmarshalledItems = Items.map(unmarshall);

  //   console.log(unmarshalledItems);

  // });

//   it("should return 1", async () => {

//     const AP_TABLE = "argenpills-pills-8c4b3e0";
    
//     const command = new GetItemCommand({
//       TableName: AP_TABLE,
//       Key: {
//         id: {S: "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"},
//       },
//     });

//     const results = await client.send(command);
// console.log(results);

//     console.log("RESULTS", JSON.stringify(results));
//     const Item = results.Item;
//     const unmarshalledItem = unmarshall(Item);

//     console.log(unmarshalledItem);

//   });

  
  // it("should search", async () => {

  //   const AP_TABLE = "argenpills-pills-8c4b3e0";
    
  //   const command = new ScanCommand({
  //     TableName: AP_TABLE,
  //     IndexName: "published-posted_date-index",
  //     FilterExpression: "contains(search_value, :c) and published = :published",
  //     ExpressionAttributeValues: {
  //       ":published": { S: 'x' },
  //       ":c": { S: "verde" }
  //     }
  //   })

  //   const results = await client.send(command);
  //   console.log("RESULTS", JSON.stringify(results));
  //   const Items = results.Items;
  //   const unmarshalledItem = Items.map(item => unmarshall(item));

  //   console.log(unmarshalledItem);

  // });

});