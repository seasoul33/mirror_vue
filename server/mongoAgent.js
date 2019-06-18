import mongoose from 'mongoose';
let io = require('socket.io')(3001);
let socket_io;
let dbCollection;
let userCollection;

const userSchema = {
    username: String,
    password: String
}

const topicSchema = {
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
                    userCollection = mongoose.model('users', new mongoose.Schema(userSchema));

                    dbCollection = mongoose.model('topics', new mongoose.Schema(topicSchema));
                    dbCollection.watch().on('change', changeCallback);
                    socketinit();
                }
    });
}

export async function registerUser(user, passwd) {
    const account = await searchUser(user);
    if(account == null) {
        await userCollection.insertMany({username: user, password: passwd});
        return 'ok'; 
    }
    return 'existed';
}

export async function searchUser(user) {
    const account = await userCollection.findOne({username: user}).exec();
    // console.log(account);
    return account;
}