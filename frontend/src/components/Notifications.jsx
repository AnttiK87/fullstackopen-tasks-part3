//Function for rendering notifications to user
const Notification = ({ message, type }) => {
    const notificationClass = type === 'success' ? 'notification success' : 'notification error';

    if (message === null) {
      return null
    }
  
    return (
      <div className={notificationClass}>
        {message}
      </div>
    )
  }

  export default Notification