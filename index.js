const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('payload', function getPayload(req) {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :payload'))

let phoneBook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    let responseBody = '<div>Phonebook has info for '+phoneBook.length+'</div>'
    responseBody += '<div>'+new Date()+'</div>'
    response.send(responseBody)
})

app.get('/api/persons', (request, response) => {
  response.json(phoneBook)
})


app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const entry = phoneBook.find(entry => entry.id === id)

    if(entry){
        response.json(entry)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phoneBook = phoneBook.filter(entry => entry.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {

    //Request Validation
    if(!request.body.name || !request.body.number){
        return response.status(400).json({
            error: 'missing name or number'
        })
    }

    if(phoneBook.filter(entry => entry.name === request.body.name).length > 0){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    //Entry Creation
    const entry = {
        name: request.body.name,
        number: request.body.number,
        id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    }

    //Adding Entry
    phoneBook = phoneBook.concat(entry)

    //Responding to Request
    response.json(entry)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})