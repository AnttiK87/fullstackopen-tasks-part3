const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const Person = require('./models/person')

// Define custom Morgan token for showing reguest body
morgan.token('body', function getBody (req) {
  return JSON.stringify(req.body)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

//Middleware for handling errors
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


app.use(cors())
app.use(express.json())

// Conditionally apply logging to terminal custom morgan token is used for post reguest and morgan tiny for others
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' ) {
    morgan(':method :url :status :res[content-length] - :response-time ms :body')(req, res, next)
  } else {
    morgan('tiny')(req, res, next)
  }
})

app.use(express.static('dist'))

//Phonebook header
app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

//Phonebook info @ http://***/info
app.get('/info', (request, response, next) => {
  const currentDate = new Date()
  const dateString = currentDate.toString()

  Person.find({})
      .then(persons => {
          response.send(`
              <p>Phonebook has info for ${persons.length} people</p>
              <p>${dateString}</p>
          `)
      })
      .catch(error => next(error))
})

// Get all persons from the phonebook @ http://***/api/persons
app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
  .catch(error => next(error))
})

// Get one person from the phonebook @ http://***/api/persons/:id
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// Add one person to the phonebook @ http://***/api/persons/
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})

// Update person at the phonebook @ http://***/api/persons/:id
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// Delete person from the phonebook @ http://***/api/persons/:id
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})