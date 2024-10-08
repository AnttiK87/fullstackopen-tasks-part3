const express = require('express')
const app = express()
require('dotenv').config()
const Person = require('./models/person')

const url = process.env.MONGODB_URI

//Phonebook content 
let persons = [

]

app.use(express.static('dist'))

const morgan = require('morgan')

const cors = require('cors')

app.use(cors())

app.use(express.json())

// Define custom Morgan token for showing reguest body
morgan.token('body', function getBody (req) {
    return JSON.stringify(req.body)
})

// Conditionally apply logging to terminal custom morgan token is used for post reguest and morgan tiny for others
app.use((req, res, next) => {
    if (req.method === 'POST') {
      morgan(':method :url :status :res[content-length] - :response-time ms :body')(req, res, next)
    } else {
      morgan('tiny')(req, res, next)
    }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

//Phonebook header @ http://localhost:3001/
app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

//Phonebook info @ http://localhost:3001/info
app.get('/info', (request, response) => {
    const currentDate = new Date()
    const dateString = currentDate.toString()
    //console.log(dateString)

    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${dateString}</p>
        `)
})

// Get all persons from the phonebook @ http://localhost:3001/api/persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// Get one person from the phonebook @ http://localhost:3001/api/persons/:id
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
      response.json(person)
    } else {
      console.log('Error: Person not found!')
      response.status(404).end()
    }
  })

  app.post('/api/persons', (request, response) => {
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
  })

// Delete person from the phonebook @ http://localhost:3001/api/persons/:id
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})