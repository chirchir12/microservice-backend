const express = require('express')
const bodyParser = require('body-parser')
const {randomBytes} = require('crypto')
const cors = require('cors')
const axios = require('axios')


const app = express()

app.use(bodyParser.json())
app.use(cors())

const commentsByPostId = {}

app.get('/posts/:id/comments', (req, res)=> {
    res.send(commentsByPostId[req.params.id] || [])

})

app.post('/posts/:id/comments', async(req, res)=> {
    const commentid = randomBytes(4).toString('hex')
    const postId = req.params.id
    const {content} = req.body
    const comments = commentsByPostId[postId] || []
    comments.push({id:commentid, content, status:'pending'})
    commentsByPostId[postId] = comments
    await axios.post('http://event-bus-srv:4005/events', {
        type:'CommentCreated',
        data:{
            id:commentid,
            content,
            postId,
            status:'pending'
        }
    })

    res.status(201).send(comments)  
})

app.post('/events', async(req, res)=> {
    console.log(`event received with type`, req.body.type)
    const {type, data} = req.body
    if(type==='CommentModerated'){
        const {postId, id, status, content} = data
        console.log(data)

        const comments = commentsByPostId[postId]
        const comment = comments.find(comment=> comment.id===id)
        console.log(comment)
        comment.status = status

        await axios.post('http://event-bus-srv:4005/events', {
        type:'CommentUpdated',
        data:{
            id,
            content,
            postId,
            status
        }
    })


    }
    res.send({status:'Okay'})
})

app.listen(4001, ()=> {
    console.log('listening on 4001')
})