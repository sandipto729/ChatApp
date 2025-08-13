import React from 'react'

const FetchContact = ({ contact }) => {
  if (!contact || contact.length === 0) {
    return <div>No contacts available</div>;
  }

  return (
    <div>
      {contact.map((c) => (
        <div key={c.id || c._id}>
          <h4>{c.name}</h4>
          <p>{c.status}</p>
        </div>
      ))}
    </div>
  )
}

export default FetchContact
