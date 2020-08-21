// users
let users = []

//addUser

const addUser = ({id, username, room}) => {
    //clean user data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    //validate user data
    if(!username || !room) {
        return {
         error: 'Username and room is required'
        }
    }
    //check existing user for duplicate username

    const duplicate = users.find((user) => {
        return user.room === room && user.username === username
    })


    if(duplicate) {
        return {
            error: 'Username in use'
        }
    }
    //store user
    const user = {id, username, room}
    users.push(user)
    return { user }

}

//Remove User
const removedUser = (id) => {
    const usersFound = users.findIndex((user) => user.id === id )
    if(usersFound !== -1){
       return users.splice(usersFound, 1)[0]
    }

}

//get user by id
const getUser = (id) => {
    return users.find((user) => user.id === id)    
}

// get users in room
const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removedUser,
    getUser,
    getUserInRoom
}