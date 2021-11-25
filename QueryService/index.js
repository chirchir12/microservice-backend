const express = require('express')
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')


const app = express()

const posts = {}

app.use(bodyParser.json())
app.use(cors())

const handleEvent = (type, data)=> {
    if (type === 'PostCreated') {
        const { id, title } = data

        posts[id] = {
            id, title, comments: []
        }

    }

    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data
        const post = posts[postId]
        post.comments.push({
            id, content, status
        })

    }

    if (type === 'CommentUpdated') {
        const { id, content, postId, status } = data
        const post = posts[postId]
        const comment = post.comments.find(comment => comment.id === id)
        comment.status = status
        comment.content = content
    }
}
app.post('/events', (req, res) => {
    const { type, data } = req.body
    handleEvent(type, data)

    //console.log(posts)

    res.send({ status: 'Ok' })

})

app.get('/posts', (req, res) => {
    res.send(posts)

})

app.listen(4002, async() => {
    console.log('listening on port 4002')
    const res = await axios.get('http://event-bus-srv:4005/events')

    for(let event of res.data){
    handleEvent(event.type, event.data)
    }
    
})

