import bot from './assets/bot.svg';
import user from './assets/user.svg';

// Importing server API URL from environment variables
const SERVER_API = import.meta.env.VITE_SERVER_API;

// Selecting DOM elements
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const chatHistoryList = document.getElementById('chat-history-list');

// Interval variable for loader animation
let loadInterval;

// Function to display loader animation
function loader(element) {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '...') { // Adjusted to three dots for faster display
      element.textContent = '';
    }
  }, 1000); // Reduced interval time to make the loader faster
}


// Function to simulate typing animation
async function typeText(element, text) {
  let index = 0;
  const speed = 5; // Adjust the typing speed (milliseconds per character); Typing speed in milliseconds per character
  const delayAfterTyping = 10; // Adjust the delay after typing all characters (milliseconds)

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

// Function to generate a unique ID
function generateUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimal = randomNumber.toString(16);
  return `id-${timestamp}-${hexaDecimal}`;
}

// Function to generate chat message stripe HTML
function chatStripe(isAI, value, uniqueID) {
  return `
    <div class="wrapper ${isAI ? 'ai' : ''}">
      <div class="chat"> <!-- Closing quote added here -->
        <div class="profile">
          <img
            src="${isAI ? bot : user}"
            alt="${isAI ? 'bot' : 'user'}"
          >
        </div>
        <div class="message" id="${uniqueID}"> <!-- Added closing quote here -->
          ${value}
        </div>
      </div>
    </div>
  `;
}

// Function to send message to server
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

// Function to handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  const data = new FormData(form);

  form.reset();

  // Store chat message in local storage
  const chatMessage = data.get('prompt');

  // User stripe (added first)
  chatContainer.innerHTML += chatStripe(false, chatMessage);

  // Focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Display bot's loader and response
  const uniqueID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, '', uniqueID); // Leave the message content empty initially

  // Call loader function immediately to start loader animation
  loader(document.getElementById(uniqueID)); // Start loader animation

  // Call server API with user's message and display bot's response
  sendMessageToServer(chatMessage)
    .then(({ data }) => {
      clearInterval(loadInterval); // Clear loader animation interval
      // Call typeText function to simulate typing animation
      typeText(document.getElementById(uniqueID), data[1]);

      // Once bot response is received, save the conversation to local storage
      const conversation = { question: chatMessage, response: data[1] };
      const chatHistory = getChatHistory();
      chatHistory.push(conversation);
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

      // Hide prompt message and prompt question after submitting the form
      hidePrompts();
    })
    .catch((error) => {
      clearInterval(loadInterval); // Clear loader animation interval
      document.getElementById(uniqueID).innerText = 'Sorry, I cannot process as of this moment!';
      console.error(error);
    });
}



// Add event listeners for form submission and keyup events
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});



// Function to display prompt questions 
async function displayPromptQuestions() {
  const promptQuestions = ['Grading System of Bisu?', 'Registration Requirements?', 'What scholarship offers are available at BISU?', 'Types of offenses and their corresponding penalty?'];

  // Create a container for all questions
  const promptContainer = document.createElement('div');
  promptContainer.classList.add('prompt-container');
  promptContainer.setAttribute('id', 'prompt-container'); // Add an ID for easier access

  // Display each prompt question individually
  promptQuestions.forEach((question, index) => {
    const button = document.createElement('button');
    button.textContent = question;
    button.style.animationDelay = `${index * 0.5}s`; // Add delay for animation effect
    button.classList.add('slide-in'); // Add animation class
    button.addEventListener('click', () => {
      // When clicked, set the prompt message and submit the form
      const textarea = document.querySelector('textarea[name="prompt"]');
      textarea.value = question;
      handleSubmit(new Event('submit'));
      // Hide the prompt container, message prompt, and question prompt
      hidePrompts();
    });

    promptContainer.appendChild(button); // Append the button to the container
  });

  // Append the container with all questions to the app div after a delay
  setTimeout(() => {
    document.getElementById('app').appendChild(promptContainer);
  }, 900); // Delay in milliseconds (3 seconds)
}


// Function to hide the prompt container, message prompt, and question prompt
function hidePrompts() {
  const promptContainer = document.getElementById('prompt-container');
  promptContainer.classList.add('hidden'); // Add a CSS class to hide the prompt container

  const floatingPrompt = document.getElementById('floating-prompt');
  floatingPrompt.classList.add('hide');

}

// Call function to display prompt questions after 3 seconds
displayPromptQuestions();

// Add event listener to hide the prompt container when clicking on any question
document.querySelectorAll('.prompt-container button').forEach(button => {
  button.addEventListener('click', () => {
    hidePrompts();
  });
});

// Add event listener to hide the prompt container when typing a question in the text area
document.querySelector('textarea[name="prompt"]').addEventListener('input', () => {
  hidePrompts();
});

// Initialize SpeechRecognition API
// Initialize SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'en-US';

const voiceBtn = document.querySelector('#voice-btn');
const textarea = document.querySelector('textarea[name="prompt"]');
const floatingPrompt1 = document.getElementById('floating-prompt');
const promptContainer = document.querySelector('.prompt-container'); // Target the prompt container

voiceBtn.addEventListener('click', () => {
  // Start speech recognition when the voice button is clicked
  recognition.start();
  // Hide the floating prompt and prompt container when speech recognition starts
  floatingPrompt1.classList.add('hide');
  if (promptContainer) {
    promptContainer.classList.add('hidden'); // Hide the prompt container if it exists
  }
  hidePrompts(); // Hide the prompts when the microphone button is clicked
});

recognition.addEventListener('result', (event) => {
  // Capture the recognized speech and set it as the value of the textarea
  const transcript = event.results[0][0].transcript;
  textarea.value = transcript; // Set the value of the textarea to the recognized speech
});

recognition.addEventListener('end', () => {
  // After speech recognition ends, submit the form to handle the user's question
  handleSubmit(new Event('submit'));
});



const newChatBtn = document.getElementById('new-chat-btn');

function createNewChatSession() {
  // Clear the chat container to start a new session
  chatContainer.innerHTML = '';

  // Display chat history in the sidebar
  displayChatHistory();

  // Show the prompt container and message prompt
  const promptContainer = document.getElementById('prompt-container');
  promptContainer.classList.remove('hidden');

  const floatingPrompt = document.getElementById('floating-prompt');
  floatingPrompt.classList.remove('hide');
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


// Function to display full conversation when clicked
function displayFullChat(conversation) {

  // Hide prompt message and prompt question
  hidePrompts();

  // Conditionally hide the container div based on media queries
  const containerDiv = document.getElementById('container');
  if (window.matchMedia("(max-width: 768px)").matches) {
    containerDiv.style.display = 'none';
  } else {
    containerDiv.style.display = 'block'; // Ensure it's visible on larger screens
  }

  // Clear chat container
  chatContainer.innerHTML = '';

  // Display user's question
  chatContainer.innerHTML += chatStripe(false, conversation.question);

  // Display bot's response
  chatContainer.innerHTML += chatStripe(true, conversation.response);
}

function displayChatHistory() {
  const chatHistory = getChatHistory();

  chatHistoryList.innerHTML = ''; // Clear previous history
  chatHistory.forEach((conversation) => {
    const listItem = document.createElement('li');
    listItem.textContent = conversation.question;

    // Add click event listener to display full chat and hide sidebar
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

const containerDiv = document.getElementById('container');

// Function to hide the container div
function hideContainerDiv() {
  containerDiv.classList.add('hide');
}

// Function to show the container div
function showContainerDiv() {
  containerDiv.classList.remove('hide');
}

const menuBtn = document.getElementById('menu-btn');

menuBtn.addEventListener('click', () => {
  // Toggle the visibility of the container div
  containerDiv.classList.toggle('show');
});

document.addEventListener("DOMContentLoaded", function () {
  var floatingPrompt = document.getElementById("floating-prompt");
  floatingPrompt.classList.remove("hide");
  // Show the container div immediately
  showContainerDiv();
});

// Check window size and hide container div if necessary
function checkWindowSize() {
  if (window.innerWidth <= 768) { // Adjust the breakpoint as needed
    hideContainerDiv();
  } else {
    showContainerDiv();
  }
}

// Call the function on page load and window resize
window.addEventListener('load', checkWindowSize);
window.addEventListener('resize', checkWindowSize);

// Function to create a new conversation
// Function to create a new conversation
function createNewConversation() {
  // Clear the chat container to start a new session
  chatContainer.innerHTML = '';

  // Display chat history in the sidebar
  displayChatHistory();

  // Show the prompt container and message prompt
  const promptContainer = document.getElementById('prompt-container');
  promptContainer.classList.remove('hidden');

  const floatingPrompt = document.getElementById('floating-prompt');
  floatingPrompt.classList.remove('hide');
}

// Add an event listener to the create button in the media queries
const createBtn = document.getElementById('create-btn'); // Assuming 'create-btn' is the ID of the create button
createBtn.addEventListener('click', createNewConversation);


// Assuming you have variables defined for your exit button and container div
const exitBtn = document.getElementById('exit-btn');
const containerDiv1 = document.getElementById('container');

exitBtn.addEventListener('click', () => {
  // Toggle the 'hide' class on the container div
  containerDiv1.classList.toggle('hide');
});

// Function to show the container div
function showContainer() {
  const container = document.getElementById('container');
  container.classList.add('show'); // Add the 'show' class to the container div
}

// Function to hide the container div
function hideContainer() {
  const container = document.getElementById('container');
  container.classList.remove('show'); // Remove the 'show' class from the container div
}

// Modify the event listener for the menu button to show the container div
menuBtn.addEventListener('click', () => {
  showContainer();
});

// Modify the event listener for the exit button to hide the container div
exitBtn.addEventListener('click', () => {
  hideContainer();
});

const menuBtn2 = document.getElementById('menu-btn');
const containerDiv3 = document.getElementById('container');

menuBtn2.addEventListener('click', () => {
  containerDiv3.style.display = containerDiv.style.display = 'block';
});

const exitBtn4 = document.getElementById('exit-btn');
const containerDiv4 = document.getElementById('container');

exitBtn4.addEventListener('click', () => {
  containerDiv4.style.display = 'none';
});




