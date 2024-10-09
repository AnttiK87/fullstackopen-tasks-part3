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

//enable Cross-Origin Resource Sharing and express library
app.use(cors())
app.use(express.json())

// Conditionally apply logging to terminal custom morgan token is used for post and put reguest and morgan tiny for others
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' ) {
    morgan(':method :url :status :res[content-length] - :response-time ms :body')(req, res, next)
  } else {
    morgan('tiny')(req, res, next)
  }
})

// Serve frontend from the 'dist' directory
app.use(express.static('dist'))

//Phonebook header
app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

//Phonebook info @ http://***/info
app.get('/info', (request, response, next) => {
  const currentDate = new Date()

  // Formatting date to 'wd mon dd YYYY hh:mm:ss GMT+0200 (Eastern European Standard Time)'
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const dayName = weekDays[currentDate.getUTCDay()]
  const monthName = months[currentDate.getUTCMonth()]
  const day = currentDate.getUTCDate()
  const year = currentDate.getUTCFullYear()

  const timePart = currentDate.toLocaleTimeString('en-GB', { hour12: false })

  const timeZoneOffset = '+0200'
  const timeZoneName = '(Eastern European Standard Time)'

  const formattedDate = `${dayName} ${monthName} ${day} ${year} ${timePart} GMT${timeZoneOffset} ${timeZoneName}`

  //Show people count in phonebook db and formatted curret date and time
  Person.find({})
    .then(persons => {
      response.send(`
              <p>Phonebook has info for ${persons.length} people</p>
              <p>${formattedDate}</p>
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
app.put('/api/persons/:id', async (request, response, next) => {
  const body = request.body

  // Creating new Person model for validating
  const validPerson = new Person({
    name: body.name,
    number: body.number,
  })

  try {
    // Wait for validating to pass
    await validPerson.validate()
    // If validation is passed continue updating phone number
    const person = {
      name: body.name,
      number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))

  } catch (error) {
    //throw an error if validation is not ok
    next(error)
  }
})

// Delete person from the phonebook @ http://***/api/persons/:id
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if (!result) {
        // if person/id is not found from db throw error for error handling
        return response.status(404).json({ error: 'Person not found' })
      }
      // else continue deleting
      response.status(204).end()
    })
    .catch(error => next(error))
})

//enable errorHandler middlevare and express librarys unknownEndpoint function
app.use(unknownEndpoint)
app.use(errorHandler)

// Set the server to listen on the specified PORT
const PORT = process.env.PORT // Get the PORT from environment variables
app.listen(PORT, () => { // Start the server and listen for incoming requests
  console.log(`Server running on port ${PORT}`) // Log the server's running status
})