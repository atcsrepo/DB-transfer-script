//Can be used to combine multiple databases into one.
//Used to transfer database between two different MongoDBs servers.
//As noted further below, the targetDB should be empty, as identical _id will throw error.

const mongoClient = require('mongodb').MongoClient;

//To use, replace the following variables with relevant equivalents
const mongoFrom = "mongodb://firstMongoDBURL:port/name";
const mongoTo = "mongodb://secondMongDBURL:port/name";
const listOfDB = ["DB name to be copied from"];
const targetDB = "DB name to be copied to";

let total = 0;

mongoClient.connect(mongoFrom, {useNewUrlParser: true}, function(err,fromClient) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to DB1");
    
    mongoClient.connect(mongoTo, {useNewUrlParser: true},function(err, toClient){
      if (err) {
        console.log(err);
      }
      
      //This assumes that the database to be copied to is empty. 
      //Duplicate keys will throw error
      //Use update/upsert instead if that is a problem
      let copyTo = toClient.db(targetDB);
      let cb = function(){
                console.log("Closing MongoDB Connections")
                toClient.close();
                fromClient.close();
              }
      
      console.log("Connected to DB2");
      
      listOfDB.forEach((dbName) => {
        let copyFrom = fromClient.db(dbName);
      
        copyFrom.listCollections().toArray((err, collections) => {
          for (let i = 0; i < collections.length; i++) {
            let collectionName = collections[i].name;
            
            console.log("Started transfer of " + collectionName + " in " + dbName + " to "+ targetDB);
            
            total++;
            
            transferCollection(copyFrom, copyTo, collectionName, cb);
          }
        });
      });      
    })
  }
})

function transferCollection(fromDB, toDB, collectionName, cb){
  let cursor;
  let collectionSize = 0;
  
  cursor = fromDB.collection(collectionName);
  
  cursor.countDocuments((err,count) => {
    collectionSize += count;
    
    cursor.find({}).forEach(function(d){
      toDB.collection(collectionName).insert(d, (err, doc) => {
        if (err) {
          throw err;
        }
        
        collectionSize--;
        
        if (collectionSize === 0) {
          console.log("Completed transfer of " + collectionName + " to "+ targetDB);
          
          validateTransfer(fromDB, toDB, collectionName, cb);
        }
      });
    });
  })
  
}

function validateTransfer(fromDB, toDB, collectionName, cb) {
  //Used to check that all collections were transferred 
  fromDB.collection(collectionName).find({}).sort({_id: 1}).toArray((err, fromDBdocs) => {
    if (err) { throw err };
    
    toDB.collection(collectionName).find({}).sort({_id: 1}).toArray((err, toDBdocs) => {
        if (err) throw {err};

        if (fromDBdocs.length !== toDBdocs.length) {
          console.log("Number of documents do not match for " + collectionName);
        } else {
          for (let i = 0; i < fromDBdocs.length; i++) {
            if (JSON.stringify(fromDBdocs[i]) != JSON.stringify(toDBdocs[i])){
              console.log("Document mismatch in " + collectionName);
              total--;
              break;
            }
            
            if (i === fromDBdocs.length - 1) {
              console.log("Completed validation of " + collectionName);
              total--;
            }
          }
          
          if (total === 0) {
            console.log("Completed all transfers");
            cb();
          }
        }
    });
  });
}