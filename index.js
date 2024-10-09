const express = require('express')
const morgan = require('morgan')

const app = express()

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

//Phonebook content. Changes doesn't affect to this. So its content is returned when server restarts
let persons = 
    [
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
    

app.use(express.json())

//Phonebook header @ http://localhost:3001/
app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

//Phonebook info @ http://localhost:3001/info
app.get('/info', (request, response) => {
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


    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${formattedDate}</p>
        `)
})

// Get all persons from the phonebook @ http://localhost:3001/api/persons
app.get('/api/persons', (request, response) => {
  response.json(persons)
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

// This generates random number between 0-999999 for ID
const generateId = () => {
  const generatedId = Math.floor(Math.random() * 1000000)
  return generatedId
}

// Add person to the phonebook @ http://localhost:3001/api/persons
app.post('/api/persons', (request, response) => {
  const body = request.body
  const checkName = persons.find(person => person.name === body.name)
  //console.log(checkName)

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

 
  if (!body.name || !body.number) {  //error handling if name or number is not provided in reguest body
    return response.status(400).json({ 
      error: 'You are trying to add a person without a name or number to the phonebook!' 
    })
  } else if (checkName != null) { //error handling if name is already in the phonebook
    return response.status(400).json({ 
        error: '"The name you are trying to add is already in the phonebook!' 
    })
  }

  persons = persons.concat(person)

  response.json(person)
})

// Delete person from the phonebook @ http://localhost:3001/api/persons/:id
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})