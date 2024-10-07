//Function for rendering header
const Header = (props) => {
  //console.log('Header gets these values', props)
  return (
      <h2>{props.header}</h2>
  )
}

//Function for rendering search input
const SearchPerson = ({searchInput, handleSearchChange}) => {
  return(
    <form>
      <div>
        Search: <input 
          value={searchInput} 
          onChange={handleSearchChange}
        />
      </div>
    </form>
  )
}

//Function for rendering persons to the list
const Persons = ({persons, deletePerson }) => {
  //console.log('Persons gets these values', persons)
  return(
    <ul>
      {persons.map(person => 
        <Person key={person.id} person={person} deletePerson={deletePerson} />
      )}
    </ul>
  )
}

//Function for rendering one person to the list
const Person = ({ person, deletePerson }) => {
  return (
    <li>
      Name: {person.name}, Number: {person.number}&nbsp;&nbsp;&nbsp;
      <button onClick={() => deletePerson(person.id)}>{'Delete'}</button>
    </li>
  )
}

//Function for rendering form for adding new persons to the list
const NewPerson = ({addPerson, newName, newNumber, handleNameChange, handleNumberChange}) => {
  return(
    <form onSubmit={addPerson}>
      <div>
        name: <input 
          value={newName} 
          onChange={handleNameChange}
        />
      </div>
      <div>
        number: <input 
          value={newNumber} 
          onChange={handleNumberChange}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}
  
export { Header, SearchPerson, Persons, NewPerson }