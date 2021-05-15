const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io();

socket.emit("joinRoom", { username, room });

//message from server
socket.on("message", (conmessage) => {
  outputMessage(conmessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //get message text
  const ms = e.target.elements.msg.value;

  //emit message to server
  socket.emit("chatMessage", ms);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.userName} <span>${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(roomN) {
  roomName.innerText = roomN;
}

function outputRoomUsers(users) {
    userList.innerHTML = '';	
    users.forEach((user) => {	
      const li = document.createElement('li');	
      li.innerText = user.username;	
      userList.appendChild(li);	
    });
}
