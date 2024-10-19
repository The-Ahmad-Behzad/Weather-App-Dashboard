const apiKey = '4954fb16958ad6900ef621d5cd0dec70';
const dialogflowKey = 'AIzaSyADvpQ0hKG8Ol2lZDS2fnn580NNjbwlFjY';
let currentPage = 1;
const itemsPerPage = 10;
const searchButton = document.getElementById('search-button');
const searchBar = document.getElementById('search-bar');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const hamburger = document.getElementById('hamburger');

let city;

hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    sidebarOverlay.classList.toggle('active');
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.add('hidden');
    sidebarOverlay.classList.remove('active');
});


searchBar.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const city = searchBar.value;
        currentPage = 1;
        fetchWeatherData(city);
    }
});

searchButton.addEventListener('click', function (e) {
    const city = searchBar.value;
    currentPage = 1;
    fetchWeatherData(city);
});



async function fetchWeatherData(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    updateTable(data);
}

function updateTable(data) {
    const tableBody = document.getElementById('forecast-table');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const items = data.list.slice(start, end);

    if (items.length <= 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-2 px-4 border-b text-center" colspan="4">End of List</td>
        `;
        tableBody.appendChild(row);  
    }
    items.forEach(item => {
      const dateTime = new Date(item.dt_txt);
      const date = dateTime.toLocaleDateString();
      const time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const temp = Math.round(item.main.temp);
      const description = capitalizeInitials(item.weather[0].description);
      
      const row = document.createElement('tr');
      row.innerHTML = `
          <td class="py-2 px-4 border-b">${date}</td>
          <td class="py-2 px-4 border-b">${time}</td>
          <td class="py-2 px-4 border-b">${temp}°C</td>
          <td class="py-2 px-4 border-b">${description}</td>
      `;
      tableBody.appendChild(row);
    });
}

function capitalizeInitials(str) {
    return str.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        if (currentPage == 5) {
            document.getElementById('next-page').disabled = false;
        }
        currentPage--;
        const city = searchBar.value;
        if (city) {
            fetchWeatherData(city);
        }
        else {
            fetchWeatherData('Islamabad');
        }
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < 6) {
        currentPage++;
        const city = searchBar.value;
        if (city) {
            fetchWeatherData(city);
        }
        else {
            fetchWeatherData('Islamabad');
        }
        if (currentPage == 5) {
            document.getElementById('next-page').disabled = true;
        }
    }
});

async function sendMessage() {
    const message = document.getElementById('chat-input').value.toLowerCase();
    const chatbot = document.getElementById('chatbot');
    let botReply = '';

    // Check if the user is asking for weather
    if (message.includes('weather')) {
        const city = searchBar.value || 'Islamabad'; // Use the input city or a default one
        const weatherData = await fetchWeatherDataForChatbot(city);
        botReply = `Here is the weather forecast for ${city}:<br><br>`;
        weatherData.forEach(item => {
            botReply += `\n${item.date}: ${item.time} - ${item.temp}°C, ${item.description}<br>`;
        });
    } 
    // Check for specific temperature-related questions
    else if (message.includes('highest') || message.includes('lowest') || message.includes('average')) {                    
        const city = searchBar.value || 'Islamabad'; // Use the input city or a default one
        const weatherData = await fetchWeatherDataForChatbot(city);
        const temperatures = weatherData.map(item => item.temp);
        const highestTemp = Math.max(...temperatures);
        const lowestTemp = Math.min(...temperatures);
        const avgTemp = (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2);
        
        botReply = `Temperature in ${city}:<br>Highest: ${highestTemp}°C<br>Lowest: ${lowestTemp}°C<br>Average: ${avgTemp}°C`;
    }
    // Default: Handle general chatbot messages
    else {
        botReply = await fetchGeminiResponse(message); // Calls the Gemini API to fetch responses for non-weather queries
    }

    // Display user message
    chatbot.innerHTML += `<div class="mb-2"><strong>You:</strong> ${message}</div>`;
    
    // Display bot reply
    chatbot.innerHTML += `<div class="mb-2"><strong>Gemini:</strong> ${botReply}</div>`;
    chatbot.scrollTop = chatbot.scrollHeight;
    
    // Clear input field
    document.getElementById('chat-input').value = '';
}

// Function to fetch weather data and structure it for the chatbot
async function fetchWeatherDataForChatbot(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();

    // Process weather data to get relevant information
    const weatherData = data.list.slice(0, 5).map(item => {
        const dateTime = new Date(item.dt_txt);
        const date = dateTime.toLocaleDateString();
        const time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp);
        const description = capitalizeInitials(item.weather[0].description);
        
        return {
            date: date,
            time: time,
            temp: temp,
            description: description
        };
    });
    return weatherData;
}

// Function to fetch responses from Gemini API for non-weather queries
async function fetchGeminiResponse(message) {
    const geminiApiKey = 'AIzaSyADvpQ0hKG8Ol2lZDS2fnn580NNjbwlFjY';
    const payload = {
        contents: [
            {
                parts: [
                    { text: message }
                ]
            }
        ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Utility function to capitalize the first letter of each word
function capitalizeInitials(str) {
    return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
}

fetchWeatherData('Islamabad');