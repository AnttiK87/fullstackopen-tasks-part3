const mongoose = require('mongoose')

// set mongoose to query syntax
mongoose.set('strictQuery', false)

// get MongoDB connection from .env
const url = process.env.MONGODB_URI

// show status on console
console.log('connecting to', url)

// connect to MongoDB database and show status on console
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

// define model and validation for items in db
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      //custom validator for phone number
      validator: function(v) {
        const phoneNroPattern = /^(?:\d{2}-\d{5,}|\d{3}-\d{4,})$/

        return phoneNroPattern.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  },
})

// customize the JSON representation, don't show id and version
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// export the Person model
module.exports = mongoose.model('Person', personSchema)