# DB-transfer-script

Used for transferring MongoDB database data. The two available scripts are fairly similar, with only one exception. 

CollateIntDB.js was the original version and was designed to combine multiple internal databases into one database.

CopyInt2ExtDB.js is a modified version of CollateIntDB and is able to take two MongoDB URLs. While it can similarly collate databases, it was originally intended to transfer collections from one server to another.

Usage is fairly self explanatory and simple involves entering the names and URLs for indicated variables. Details can be found in the files themselves.
