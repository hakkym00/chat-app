const showUsers = () => {
    const sidebar =document.querySelector('#sidebar')
    if(sidebar.style.transform === 'translateX(-230px)'){
        sidebar.style.transform = 'translateX(0px)'
        sidebar.style.display = 'block'
        sidebar.style.height = '100vh'
        sidebar.style.overflowY = 'scroll'
    }else{
        sidebar.style.transform = 'translateX(-230px)'
        sidebar.style.display = 'none'

    }
}

const socket = io()

//Elements
const messageForm =document.querySelector('form')
const messageButton = messageForm.querySelector('button')
const messageInput = messageForm.querySelector('input')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//options

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
socket.emit('join', {username, room}, (error) => {
    if(error){
        location.href = '/'
        alert(error)
    }
})

//autoscroll
const autoScroll = () => {
    //last message
    const newMessage = messages.lastElementChild
    //last message height
    const newMessageStyle = getComputedStyle(newMessage).marginBottom
    const newMessageMargin = parseInt(newMessageStyle)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = messages.offsetHeight

    // contentHeight
    const contentHeight = messages.scrollHeight

    //how far i scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if(contentHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.offsetHeight
    }

    console.log(visibleHeight)
    console.log(contentHeight)
    console.log(newMessageHeight)
    console.log(contentHeight - newMessageHeight)
    console.log(scrollOffset)

}
const pageScroll = () => {
    window.scrollBy(0,1);
    scrolldelay = setTimeout(pageScroll,100);
}

socket.on('message', (newMessage) => {
    const messageRendered =  Mustache.render(messageTemplate, {
        newMessage : newMessage.text,
        createdAt : moment(newMessage.createdAt).format('h:mm a'),
        username: newMessage.username
    })
    messages.insertAdjacentHTML("beforeend", messageRendered)
    autoScroll()
    pageScroll()

})

socket.on('locationMessage', (location) => {
    const locationRendered = Mustache.render(locationTemplate, {
        url : location.url,
        createdAt: moment(location.createdAt).format('h:mm a'),
        username: location.username
    })
    messages.insertAdjacentHTML('beforeend', locationRendered)
    autoScroll()
    pageScroll()
})

socket.on('roomData', ({room, users}) => {

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    messageButton.setAttribute('disabled', 'disabled')
    
    const inputMessage = e.target.elements.message.value
    socket.emit('sendMessage', inputMessage, (message) => {
        messageInput.value =''
        messageInput.focus()
        messageButton.removeAttribute('disabled')
        console.log(message)
    })
    
})


sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Your browser doesnot support geolocation')
    }
    
    sendLocationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position) => {
        
        const {latitude, longitude} = position.coords
        socket.emit('sendLocation', {latitude, longitude}, (message) => {
            sendLocationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})
