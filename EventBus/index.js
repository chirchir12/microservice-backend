const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

const events = [];


app.post('/events', (req, res)=> {
    const event = req.body
    // console.log(event)
    events.push(event)

    axios.post('http://posts-cluster-srv:4000/events', event)
    axios.post('http://comments-service-cluster-srv:4001/events', event)
    axios.post('http://query-service-cluster-srv:4002/events', event)
    axios.post('http://moderation-service-cluster-srv:4003/events', event)

    res.send({status:'Ok'})

})

app.get('/events', (req, res)=> {
    res.send(events)
})

app.listen(4005, ()=> {
    console.log('listen on port 4005')
})