const express = require('express')
const bodyParser = require('body-parser')
const {randomBytes} = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()

console.log(app)

app.use(bodyParser.json())
app.use(cors())

const posts = {}

app.get('/posts', (req, res)=> {
    res.send(posts)

})

app.post('/posts', async(req, res)=> {
    const id = randomBytes(4).toString('hex')
    const {title} = req.body

    posts[id] = {
        id, title
    }

    await axios.post('http://event-bus-srv:4005/events', {
        type:'PostCreated',
        data:{
            id, title
        }
    })

    res.status(201).send(posts[id])
    
})

app.post('/events', (req, res)=> {
    console.log(`event received with type`, req.body.type)
    res.send({status:'Okay'})
})

console.log(app.routes)

app.listen(4000, ()=> {
    console.log('v2')
    console.log('listening on 4000')
})