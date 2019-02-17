# MongoDB collection transfer script

Used for transferring MongoDB database data. The two available scripts are fairly similar, with only one exception. 

CollateIntDB.js was the original version and was designed to combine multiple internal databases into one database.

CopyInt2ExtDB.js is a modified version of CollateIntDB and is able to take two MongoDB URLs. While it can similarly collate databases, it was originally intended for transferring collections from one server to another.

### How to use

Usage is fairly self explanatory and simply involves entering the names and URLs for indicated variables. Details can be found in the files themselves. Note that the script assumes that the second database is empty, as it performs inserts on collections. Inserts will throw an error if there is already an object with the same ID in the target database. If that is a problem, change the operation to update/upsert instead.
