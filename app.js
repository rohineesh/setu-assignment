const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb+srv://rohineesh:setu123@customer.mh1cu.mongodb.net/retryWrites=true&w=majority";
const DATABASE_NAME = "customerdb";
const port = process.env.PORT || 8080
const api = "x-api-key"
const value = "0"
var countOfIds = 1

var firebaseConfig = {
    apiKey: "api-key",
    authDomain: "project-id.firebaseapp.com",
    databaseURL: "https://project-id.firebaseio.com",
    projectId: "project-id",   
    storageBucket: "project-id.appspot.com",
    messagingSenderId: "sender-id",
    appId: "app-id",
    measurementId: "G-measurement-id",
  };

var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var database, collection;
 
app.listen(port, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            console.log('error in connecting to mongodb'+error)
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("customercollection");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

function generateUniqueId(count, k) {
    var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var str = '';
    for(var i = 0; i < count; i++) {
        str += _sym[parseInt(Math.random() * (_sym.length))];
    }
    k(str)
}

app.post('/api/v1/fetch-bill', function (req, res) {    
    if(req.headers[api] !== "12345"){
        console.log(req.headers[api])
        res.status(403)
        res.send({"status":"ERROR","errorCode":"auth-error"})
    }
    else if(!req.body.mobileNumber){
        res.status(400)
        res.send({"status":"ERROR","errorCode":"invalid-api-parameters"})
    }
    else{
        result = collection.findOne({ mobileNumber: req.body.mobileNumber},(error,result)=>{
            if(error) {
                return res.status(500).send(error);
            }
            else if (result) {
                        console.log(`Found a listing in the collection with the name`);
                        console.log(result);
                        res.status(200)
                        res.send({
                        "status": "SUCCESS",
                        "data": {
                        "customerName": result.customerName ,
                        "dueAmount": result.dueAmount,
                        "dueDate": result.dueDate,
                        "refID": result.refID
                        }})
                    }
            else        {
                        res.status(404)
                        res.send({"status":"ERROR","errorCode":"customer-not-found"})
                        }
        });
    }
});


app.post('/api/v1/payment-update',function(req,res){
    if(req.headers[api] !== "12345"){
        console.log(req.headers[api])
        res.status(403)
        res.send({"status":"ERROR","errorCode":"auth-error"})
    }
    else if(req.body.refID){
            result = collection.findOne({ refID: req.body.refID},(error,result)=>{
            if(error) {
                return res.status(500).send(error);
            }
            else if (result) {
                if(req.body.transaction && req.body.transaction.amountPaid && req.body.transaction.id)
                {
                        if(!result.billPaid){
                            if(result.dueAmount !== req.body.transaction.amountPaid){
                                res.status(400)
                                res.send({"status":"ERROR","errorCode":"amount-mismatch"})
                            }
                            else{
                                countOfIds++;
                                generateUniqueId(countOfIds, function(uniqueId){
                                    var myquery = { refID: req.body.refID };
                                    //var newvalues = { $set: {billPaid: true, transId: req.body.transaction.id, ackID: uniqueId, dueAmount: value} };
                                    collection.updateOne(myquery, newvalues, function(error, response) {
                                        if(error)
                                            return res.status(500).send(error);   
                                        else{
                                            res.status(200)
                                            res.send({
                                                "status": "SUCCESS",
                                                "data": {       
                                                "ackID": uniqueId
                                                }
                                            })
                                        }                            
                                    })
                                })
                            }       
                        }
                        else{
                            if(req.body.transaction.id !== result.transId){
                                res.status(400)
                                res.send({"status":"ERROR","errorCode":"invalid-ref-id"})
                            }
                            else{
                                res.status(200)
                                res.send({
                                        "status": "SUCCESS",
                                        "data": {       
                                        "ackID": result.ackID
                                        }
                                })
                            }
                        }
                    
                }
                else{
                    res.status(400)
                    res.send({"status":"ERROR","errorCode":"invalid-api-parameters"})
                }
            }
            else{
                res.status(404)
                res.send({"status":"ERROR","errorCode":"invalid-ref-id"})
            }
        })
    }
    else{
        res.status(400)
        res.send({"status":"ERROR","errorCode":"invalid-api-parameters"})
    }
})
