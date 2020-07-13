const {MongoClient} = require('mongodb');


//async function main(){
const uri = "mongodb+srv://rohineesh:setu123@customer.mh1cu.mongodb.net/retryWrites=true&w=majority"

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = {listDatabases,findOneListingByName};

async function listDatabases(client){
    await client.connect();
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function findOneListingByName(client, mobilenumber) {
    await client.connect();
    result = await client.db("customerdb").collection("customercollection")
                        .findOne({ mobileNumber: mobilenumber });

    if (result) {
        console.log(`Found a listing in the collection with the name '${mobilenumber}':`);
        console.log(result);
    } else {
        console.log(`No listings found with the name '${mobilenumber}'`);
    }
}

/*try {
    await client.connect();

    await listDatabases(client);

    await findOneListingByName(client, "9898000012");

   
 
} catch (e) {
    console.error(e);
}
finally {
    await client.close();
}
}

main().catch(console.error)
*/

