import mongoose from 'mongoose';
// import {MongoClient} from 'mongodb';
let io;
let socket_io;
let dbCollection;

const schema = {
    title: String,
    description: String,
    tags: Array,
    raisedAt: String,
    sponsor: String,
    seconded: Number,
    secondlist: Array,
    replied: Number,
    repliedTime: String,
    anwser: String,
    accept: Number,
    acceptlist: Array,
    suck: Number,
    sucklist: Array
}

function changeCallback() {
    // console.log("DB updated...");

    // Should only update what's changed instead of whole data.
    if(socket_io) {
        let msg = {a: [], b: []};
        dbCollection.find({}).sort({seconded: -1}).then(function (contentA) {
            msg.a = contentA.slice();
            dbCollection.find({}).sort({raisedAt: -1}).then(function (contentB) {
                msg.b = contentB.slice();
                socket_io.emit('mongo_sync', msg);
            });
        });
    }
}

function socketinit(){
    let msg={a:[], b:[]};
    io = require('socket.io')(3001);
    io.on('connection', function (socket) {
        console.log('socket connected:'+socket.id)
        socket_io = socket;
        
        dbCollection.find({}).sort({seconded: -1}).then(function (contentA) {
            msg.a = contentA.slice();
            dbCollection.find({}).sort({raisedAt: -1}).then(function (contentB) {
                msg.b = contentB.slice();
                socket.emit('mongo_sync',msg);
            });
        });
    });
}


export function mongoInit(IPPort, callback) {
    let url = "mongodb://" + IPPort + "/myDB?replicaSet=replocal";
    mongoose.connect(url, {useNewUrlParser: true}, (err, res) => {
                    if (err) {
                        console.log('Failed to connected to ' + url);
                        return null;
                    } else {
                        console.log('Connected to ' + url);
                        dbCollection = mongoose.model('topics', new mongoose.Schema(schema));
                        dbCollection.watch().on('change', changeCallback);
                        // dbCollection.find({}).then(function(content){console.log(content)});
                        socketinit();
                    }
    });
    
    
    // MongoClient.connect('mongodb://' + IPPort, function(err, client){
    //     if (err) {
    //         console.log('Failed to connected to ' + url);
    //         return null;
    //     } else {
    //         console.log('Connected to ' + url);
    //         const dbCollection = client.db('myDB').collection('topics');
    //         if (callback) {
    //             dbCollection.watch().on('change', callback);
    //         }
    //         dbCollection.find({}).then(function (content) {
    //             console.log(content)
    //         });
    //         return dbCollection;
    //     }
    // });
}

// export function mDB() {
//     return dbCollection;
// }