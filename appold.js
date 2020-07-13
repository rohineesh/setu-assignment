const express = require('express')

const {MongoClient} = require('mongodb');
//const mong = require('./mongo')
const app = express()
const bodyParser = require('body-parser');

const port = 3006

const apikey = '12345'

//mongodb+srv://rohineesh:<password>@customer.mh1cu.mongodb.net/<dbname>?retryWrites=true&w=majority
    const uri = "mongodb+srv://rohineesh:setu123@customer.mh1cu.mongodb.net/retryWrites=true&w=majority"

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    
    
    //module.exports = {listDatabases,findOneListingByName};
    
    async function listDatabases(client){
        await client.connect();
        databasesList = await client.db().admin().listDatabases();
     
        console.log("Databases:");
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    };
    
    async function findOneListingByName(mobilenumber,callback) {
        try {
        result = await client.db("customerdb").collection("customercollection")
        .findOne({ mobileNumber: mobilenumber });
        



if (result) {
console.log(`Found a listing in the collection with the name '${mobilenumber}':`);
console.log(result);
callback("200",result)
} else {
console.log(`No listings found with the name '${mobilenumber}'`);
client.close();
callback("404",result)
}

        
           
         
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.close();
        }
       
    }

app.get('/', (req, res) => res.send('Hello World!'))

app.use(bodyParser.urlencoded({
    extended: true
  }));


app.post('/api/v1/fetch-bill', function (req, res) {
    console.log(req.body);
    console.log(JSON.stringify(req.headers));
    
    //if(req.headers.x-api-key === apikey){
        if(!req.body.mobileNumber)
        {
            res.status(400)
            res.send({"status":"ERROR","errorCode":"invalid-api-parameters"})
        }
        var result
        findOneListingByName(req.body.mobileNumber,function(statusCode,result){
            if(statusCode === '200')
            {
                res.status(200)
                res.send({
                "status": "SUCCESS",
                "data": {
                "customerName": result.customerName ,
                 "dueAmount": result.dueAmount,
                 "dueDate": result.dueDate,
                "refID": result.refID
                }}
            )}
            
            else{
                if(statusCode === '404')
                {
                    res.status(404)
                    res.send({"status":"ERROR","errorCode":"customer-not-found"})
                }
    
            }

        })
    //}
    /*else{
        res.status(403)
        res.send({"status":"ERROR","errorCode":"auth-error"})
    }
    */
    
  })

app.listen(port, () => console.log(`Example app listening at  ${port}`))












