//Used to combine multiple internal databases into one

const mongoClient = require('mongodb').MongoClient;

//Just replace the following variables to use
const mongoURL = "mongodb://mongoDBURL:port";
const listOfDB = ["db1", "db2", "db3"];
const targetDB = "new DB name";

let total = 0;

mongoClient.connect(mongoUrl, function(err,client) {
  if (err) {
    console.log(err);
  } else {
    //This assumes that the database to be copied to is empty. 
    //Duplicate _id will throw error
    //Use update/upsert instead if that is a problem
    let copyTo = client.db(targetDB);
    
    listOfDB.forEach((dbName) => {
      let copyFrom = client.db(dbName);
    
      copyFrom.listCollections().toArray((err, collections) => {
        for (let i = 0; i < collections.length; i++) {
          let collectionName = collections[i].name;
          
          console.log("Started transfer of " + collectionName + " in " + dbName + " to "+ targetDB);
          
          total++;
          
          transferCollection(copyFrom, copyTo, collectionName);
        }
      });
    });
  }
})

function transferCollection(fromDB, toDB, collectionName){
  let cursor;
  let collectionSize = 0;
  
  cursor = fromDB.collection(collectionName);
  
  cursor.count((err,count) => {
    collectionSize += count;
    
    cursor.find({}).forEach(function(d){
      toDB.collection(collectionName).insert(d, (err, doc) => {
        if (err) {
          throw err;
        }
        
        collectionSize--;
        
        if (collectionSize === 0) {
          console.log("Completed transfer of " + collectionName + " to "+ targetDB);
          
          validateTransfer(fromDB, toDB, collectionName);
        }
      });
    });
  })
  
}

function validateTransfer(fromDB, toDB, collectionName) {
  //Used to check that all collections were transferred 
  fromDB.collection(collectionName).find({}).toArray((err, fromDBdocs) => {
    if (err) { throw err };
    
    toDB.collection(collectionName).find({}).sort({_id: 1}).toArray((err, toDBdocs) => {
        if (err) throw {err};

        if (fromDBdocs.length !== toDBdocs.length) {
          console.log("Number of documents do not match for " + collectionName);
        } else {
          for (let i = 0; i < fromDBdocs.length; i++) {
            if (JSON.stringify(fromDBdocs[i]) != JSON.stringify(toDBdocs[i])){
              console.log("Document mismatch in " + collectionName);
              break;
            }
            
            if (i === fromDBdocs.length - 1) {
              console.log("Completed validation of " + collectionName);
              total--;
              
              if (total === 0) {
                console.log("Completed all transfers");
              }
            }
          }
        }
    });
  });
}
