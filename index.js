require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/Person')

const app = express()

app.use(express.json())

app.use(cors())

app.use(express.static('build'))

morgan.token('payload', function getPayload(req) {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :payload'))

app.get('/info', (request, response, next) => {
    let requestTime = new Date()
    Person.find({}).then(result => {
        let responseBody = '<div>Phonebook has info for '+result.length+'</div>'
        responseBody += '<div>'+requestTime+'</div>'
        response.send(responseBody)
    }).catch(error => next(error))

})

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(result => {
        response.send(result)
    }).catch(error => next(error))

})


app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(
        result =>{
            console.log(result)
            if(result){
                response.json(result)
            } else {
                response.status(404).end()
            }
        }
    ).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result =>{
            response.status(204).end()
        }
    ).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    //Request Validation
    if(!request.body.name || !request.body.number){
        return response.status(400).json({
            error: 'missing name or number'
        })
    }

    //Entry Creation
    const newPerson = new Person({
        name: request.body.name,
        number: request.body.number,
    })        

    //Save to DB
    newPerson.save().then(
        result => {
            console.log('Person '+ newPerson.name +' Saved!')
            //Responding to Request
            response.json(newPerson)
            }
    ).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {

    //Request Validation
    if(!request.body.number){
        return response.status(400).json({
            error: 'missing number'
        })
    }
    
    //Create the new data
    const person = {
        number: request.body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { runValidators: true }, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {

    console.error(error.message)
    if (error.name === 'CastError') {
        response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'MongoServerError' || error.name === 'ValidationError') {
        response.status(400).json({ error: error.message })
    }

    next(error)
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})