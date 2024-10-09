import { useState, useEffect } from 'react'
import phonebookService from './services/phonebook'
import { Header, SearchPerson, Persons, NewPerson } from './components/UiComponents'
import Notification from './components/Notifications'

// App component for rendering the main structure of the application
const App = () => {
  //variables
  const header1 = 'Phonebook'
  const header2 = 'Add a new'
  const header3 = 'Numbers'
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('Add new name')
  const [newNumber, setNewNumber] = useState('Add new number')
  const [searchInput, setSearchInput] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [messageType, setMessageType] = useState("")
  const messageAdded = `Added ${newName} to the phonebook!`
  const messageUpdated = `Persons ${newName} phonenumber updated to the phonebook!`

  // Function for getting persons from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const initialPersons = await phonebookService.getAll()
        setPersons(initialPersons)
      } catch (error) {
        showMessage("An error occurred while fetching data. Please try again later.", "error")
        console.error("Error fetching persons:", error)
      }
    }
    fetchData()
  }, [])

  //function for adding person to server
  const addPerson = (event) => {
    event.preventDefault()

    //check is inputted name in the phonebook 
    const findDublicate = persons.find(person => person.name === newName)
    //console.log('findDublicate gets this values', findDublicate) //for debugging

    //if name is not in the phonebook add new person or show error alert
    if (!findDublicate){
      const personObject = {
        name: newName,
        number: newNumber
      }

      phonebookService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('Add new name')
        setNewNumber('Add new number')
        showMessage(messageAdded, "success")
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.error) {
          //for validating errors
          showMessage(error.response.data.error, "error")
        } else {
          //for other errors
          showMessage("An unexpected error occurred", "error")
        }
      })
    } else{
      if (window.confirm(`${findDublicate.name} is already added to this phonebook, replace the old number (${findDublicate.number}) with a new one (${newNumber})?`)) {
        changeNumber(findDublicate.id)
        .then(() => {
          // these are run only if changeNumber function succeeds
          setNewNumber('Add new number')
          setNewName('Add new name')
          showMessage(messageUpdated, "success")    
        })
        .catch(error => {
          if (error.response && error.response.data && error.response.data.error) {
            // for validating errors
            showMessage(error.response.data.error, "error")
          } else {
            // Other errors
            showMessage(errorMessage, "error")
          }
        })
      }
    }
  }

  //function for deleting person from server/db.json file
  const deletePerson = id => {
    const person = persons.find(p => p.id === id)
      const messageDeleted = `${person.name} deleted from the phonebook!`
      const errorMessage = `${person.name} was already deleted from the phonebook!`

    if (window.confirm(`Delete ${person.name}?`)) {
      phonebookService
        .del(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          showMessage(messageDeleted, "success")
        })
        .catch(error => {
          if (error.response.status === 404) {
            console.error("Failed to delete person", error)
            showMessage(errorMessage, "error")
            setPersons(persons.filter(person => person.id !== id))
          } else {
            //for other errors
            showMessage("An unexpected error occurred", "error")
          }
        })
    }
  }

  //filtering to show persons that starts with search input
  const itemsToShow = showAll
  ? persons
  : persons.filter(person => 
      person.name.toLowerCase().startsWith(searchInput.toLowerCase())
  )

  //function for setting state for new name
  function handleNameChange(event) {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  //function for setting state for new number
  function handleNumberChange(event) {
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }

  //function for setting state for search/filtering results
  function handleSearchChange(event) {
    console.log(event.target.value)
    setSearchInput(event.target.value)
    setShowAll(false)
  }

  //function for changing phone number for existing person
  const changeNumber = id => {
    const person = persons.find(person => person.id === id)
    const changedNumber = { ...person, number: newNumber }
    const errorMessage = `Something went wrong while updating ${person.name}'s phone number!`

    // Return phonebookService.update-promise
    return phonebookService
      .update(id, changedNumber)
      .then(returnedPerson => {
        setPersons(persons.map(person => person.id !== id ? person : returnedPerson))
      })
      .catch(error => {
        throw(error)
      })
}


// Function for showing notifications to user
const showMessage = (message, messageType) => {
  setNotificationMessage(message)
  setMessageType(messageType)

  // If message type is error display time is longer
  const displayTime = messageType === 'error' ? 10000 : 3000 // error message 10 s, other 3 s

  setTimeout(() => {
    setNotificationMessage(null)
  }, displayTime)
}

  //return dom for browser to render the application
  return (
    <div>
      <Header header={header1} />
      <Notification message={notificationMessage} type={messageType} />
      <SearchPerson 
          searchInput={searchInput} 
          handleSearchChange={handleSearchChange} 
      />
      <Header header={header2} />
      <NewPerson 
          addPerson={addPerson} 
          newName={newName} 
          newNumber={newNumber} 
          handleNameChange={handleNameChange} 
          handleNumberChange={handleNumberChange}
      />
      <Header header={header3} />
      <Persons persons={itemsToShow} deletePerson={deletePerson} />
    </div>
  )

}

export default App