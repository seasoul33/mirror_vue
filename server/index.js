const mongoAgent = require('./mongoAgent.js')

const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const jwt = require('express-jwt')
const bodyParser = require('body-parser')
const jsonwebtoken = require('jsonwebtoken')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  mongoAgent.mongoInit('localhost:27017');

  app.use(bodyParser.json()) ;
  app.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    const result = await mongoAgent.registerUser(username, password);
    if(result === 'existed') {
      res.send({message: 'existed'});
    }
    res.end();
  });
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const userFound = await mongoAgent.searchUser(username);
    const valid = (userFound.password === password);

    if(!valid) {
      res.status(401).send({message: 'Invalid username or password'});
      return;
    }
    const accessToken = jsonwebtoken.sign({username}, 'dummy');

    res.json({ token: accessToken })
  });
  app.get('/api/auth/user', jwt({secret: 'dummy'}), (req, res, next) => {
    // console.log(req.user);
    res.json({ user: req.user })
  })
  app.post('/api/auth/logout', (req, res, next) => {
    res.json({ status: 'OK' })
  });

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
