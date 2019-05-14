import mongoose from 'mongoose';
let io = require('socket.io')(3001);
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

async function fetchData() {
    const bySecond = await dbCollection.find({}).sort({seconded: -1}).slice();
    const byTime = await dbCollection.find({}).sort({raisedAt: -1}).slice();
    return {bySecond,byTime};
}

async function changeCallback() {
    // console.log("DB updated...");

    // TODO: Should only update what's changed instead of whole data.
    if(socket_io) {
        socket_io.emit('mongo_sync', await fetchData());
    }
}

function socketinit(){
    io.on('connection', async function (socket) {
        console.log('socket connected:'+socket.id)
        socket_io = socket;
        socket.emit('mongo_sync', await fetchData());

        socket.on('delete', async function (msg) {
            // console.log(msg);
            let result = await dbCollection.deleteOne({_id:msg._id});
            //console.log(result);
        });

        socket.on('update', async function (msg) {
            // console.log(msg);
            let result = await dbCollection.updateOne({_id:msg._id}, msg);
            // console.log(result);
        });

        socket.on('insert', async function (msg) {
            // console.log(msg);
            let result = await dbCollection.insertMany(msg);
            // console.log(result);
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
                    socketinit();
                }
    });
}