import bot from './assets/bot.svg';
import user from './assets/user.svg';

const SERVER_API = import.meta.env.VITE_SERVER_API;

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const chatHistoryList = document.getElementById('chat-history-list');

let loadInterval;

function loader(element) {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

async function typeText(element, text) {
  let index = 0;
  const speed = 20; // Adjust the typing speed (milliseconds per character)
  const delayAfterTyping = 500; // Adjust the delay after typing all characters (milliseconds)

  // Clear the existing content of the element
  element.innerHTML = '';

  // Simulate typing animation
  const typingInterval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      // Clear the interval after typing all characters
      clearInterval(typingInterval);
      // Add a delay after typing all characters (optional)
      setTimeout(() => {
        // Do something after typing completion, if needed
      }, delayAfterTyping);
    }
  }, speed);
}

function generateUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimal = randomNumber.toString(16);
  return `id-${timestamp}-${hexaDecimal}`;
}

function chatStripe(isAI, value, uniqueID) {
  return `
    <div class="wrapper ${isAI && 'ai'}">
      <div class="chat"> <!-- Missing closing quote for class attribute -->
        <div class="profile">
          <img
            src="${isAI ? bot : user}"
            alt="${isAI ? 'bot' : 'user'}"
          >
        </div>
        <div class="message" id=${uniqueID}>
          ${value}
        </div>
      </div>
    </div>
  `;
}

async function sendMessageToServer(message) {
  const response = await fetch(`${SERVER_API}/completions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  return response.json();
}

async function handleSubmit(e) {
  e.preventDefault();
  const data = new FormData(form);

  form.reset();

  // Store chat message in local storage
  const chatMessage = data.get('prompt');

  // User stripe
  chatContainer.innerHTML += chatStripe(false, chatMessage);
  // Bot stripe
  const uniqueID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, '', uniqueID); // Leave the message content empty initially
  loader(document.getElementById(uniqueID)); // Start loader animation

  // Focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const chatHistory = getChatHistory();
  chatHistory.push(chatMessage);
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

  // call server
  sendMessageToServer(chatMessage)
    .then(({ data }) => {
      clearInterval(loadInterval); // Clear loader animation interval
      // Call typeText function to simulate typing animation
      typeText(document.getElementById(uniqueID), data[1]);
    })
    .catch((error) => {
      clearInterval(loadInterval); // Clear loader animation interval
      document.getElementById(uniqueID).innerText = 'Sorry, I cannot process as of this moment!';
      console.error(error);
    })
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'en-US';

const voiceBtn = document.querySelector('#voice-btn');
const textarea = document.querySelector('textarea[name="prompt"]');

voiceBtn.addEventListener('click', () => {
  recognition.start();
});

recognition.addEventListener('result', (event) => {
  const transcript = event.results[0][0].transcript;
  textarea.value = transcript;
});

recognition.addEventListener('end', () => {
  handleSubmit(new Event('submit'));
});

const newChatBtn = document.getElementById('new-chat-btn');

function createNewChatSession() {
  // Clear the chat container to start a new session
  chatContainer.innerHTML = '';

  // Display chat history in the sidebar
  displayChatHistory();
}

newChatBtn.addEventListener('click', createNewChatSession);

function clearChatHistory() {
  localStorage.removeItem('chatHistory');
  chatHistoryList.innerHTML = ''; // Clear the chat history list
}

// Add an event listener to a button or link to trigger the clearChatHistory function
const clearChatBtn = document.getElementById('clear-chat-btn');
clearChatBtn.addEventListener('click', clearChatHistory);

// Function to retrieve chat history from local storage
function getChatHistory() {
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  return chatHistory;
}

// Function to display full chat message when clicked
function displayFullChat(conversation) {
  chatContainer.innerHTML = ''; // Clear chat container
  chatContainer.innerHTML += chatStripe(false, conversation); // Display full conversation
}

// Function to display chat history in the sidebar
function displayChatHistory() {
  const chatHistory = getChatHistory();

  chatHistoryList.innerHTML = ''; // Clear previous history
  chatHistory.forEach((conversation) => {
    const firstTenWords = conversation.split(' ').slice(0, 10).join(' ');
    const listItem = document.createElement('li');
    listItem.textContent = firstTenWords;

    // Add click event listener to display full chat
    listItem.addEventListener('click', () => {
      displayFullChat(conversation);
    });

    chatHistoryList.appendChild(listItem);
  });
}

// Redisplay chat history when clicked again
chatHistoryList.addEventListener('click', () => {
  displayChatHistory();
});

// Initial display of chat history
displayChatHistory();

const floatingPrompt = document.getElementById('floating-prompt');

form.addEventListener('input', () => {
  floatingPrompt.classList.add('hide');
});

const menuBtn = document.getElementById('menu-btn');
const containerDiv = document.getElementById('container');

menuBtn.addEventListener('click', () => {
  // Toggle the visibility of the container div
  containerDiv.classList.toggle('show');
});


document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    var floatingPrompt = document.getElementById("floating-prompt");
    floatingPrompt.classList.remove("hide");
  }, 2000); // Delay for 3 seconds (3000 milliseconds)
});