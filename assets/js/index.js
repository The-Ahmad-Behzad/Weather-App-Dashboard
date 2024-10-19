let currentUnit = 'metric';
let currentTemperature = null;
const spinner = document.getElementById('loading-spinner');

const searchBar = document.getElementById('search-bar');      
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const hamburger = document.getElementById('hamburger');
const searchButton = document.getElementById('search-button');
const unitToggle = document.getElementById('unit-toggle');

const background = document.getElementsByTagName('body');
const weatherWidget = document.getElementById('weather-widget');
const weatherData = document.getElementById('weather-data');

const apiKey = '4954fb16958ad6900ef621d5cd0dec70';


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
        fetchWeatherData(city);
    }
});

searchButton.addEventListener('click', function (e) {
    const city = searchBar.value;
    fetchWeatherData(city);
});

unitToggle.addEventListener('click', function () {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    if (currentTemperature) {
        updateTemperatureDisplay(currentTemperature);
    }
});

function fetchWeatherData(city) {
    spinner.style.display = 'flex';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateWeatherWidget(data);
            spinner.style.display = 'none';
        })
        .catch(error => console.error('Error fetching weather data:', error));
        
    const url2 = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url2)
        .then(response => response.json())
        .then(data => {
            updateCharts(data);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

let barChart, doughnutChart, lineChart;

function updateCharts(data) {
    const temperatures = data.list.slice(0, 5).map(item => item.main.temp);
    const weatherConditions = data.list.slice(0, 5).map(item => item.weather[0].main);

    const barChartCtx = document.getElementById('bar-chart').getContext('2d');
    const doughnutChartCtx = document.getElementById('doughnut-chart').getContext('2d');
    const lineChartCtx = document.getElementById('line-chart').getContext('2d');

    if (barChart) {
        barChart.destroy();
    }
    if (doughnutChart) {
        doughnutChart.destroy();
    }
    if (lineChart) {
        lineChart.destroy();
    }

    barChart = new Chart(barChartCtx, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            animation: {
                delay: 400
            }
        }
    });

    const weatherCounts = weatherConditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    doughnutChart = new Chart(doughnutChartCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(weatherCounts),
            datasets: [{
                data: Object.values(weatherCounts),
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            animation: {
                delay: 400
            }
        }
    });

    lineChart = new Chart(lineChartCtx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            animation: {
                easing: 'easeInBounce'
            }
        }
    });
}


function updateWeatherWidget(data) {
    const weather = data.weather[0];
    const iconUrl = `http://openweathermap.org/img/wn/${weather.icon}.png`;
    const description = weather.description;
    document.getElementById('weather-icon').innerHTML = `<img src="${iconUrl}" alt="${description}" class="w-8 h-8">`;
    document.getElementById('weather-data').textContent = `${data.name}`;
    currentTemperature = data.main.temp;
    updateTemperatureDisplay(currentTemperature);
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById('weather-description').textContent = description;
    if (unitToggle.classList.contains('hidden')) {
            unitToggle.classList.remove('hidden');
        }
    
    if (description.includes('clear')) {
        weatherWidget.classList.add('bg-yellow-400');
        if (weatherWidget.classList.contains('bg-gray-400')) {
            weatherWidget.classList.remove('bg-gray-400');
        }
        else if (weatherWidget.classList.contains('bg-blue-400')) {
            weatherWidget.classList.remove('bg-blue-400');
        }
        else if (weatherWidget.classList.contains('bg-gray-200')) {
            weatherWidget.classList.remove('bg-gray-200');
        }
        else if (weatherWidget.classList.contains('bg-white')) {
            weatherWidget.classList.remove('bg-white');
        }
    } else if (description.includes('cloud')) {
        weatherWidget.classList.add('bg-gray-200');
        if (weatherWidget.classList.contains('bg-gray-400')) {
            weatherWidget.classList.remove('bg-gray-400');
        }
        else if (weatherWidget.classList.contains('bg-blue-400')) {
            weatherWidget.classList.remove('bg-blue-400');
        }
        else if (weatherWidget.classList.contains('bg-yellow-400')) {
            weatherWidget.classList.remove('bg-yellow-400');
        }
        else if (weatherWidget.classList.contains('bg-white')) {
            weatherWidget.classList.remove('bg-white');
        }
    } else if (description.includes('rain')) {
        weatherWidget.classList.add('bg-blue-400');
        if (weatherWidget.classList.contains('bg-gray-400')) {
            weatherWidget.classList.remove('bg-gray-400');
        }
        else if (weatherWidget.classList.contains('bg-yellow-400')) {
            weatherWidget.classList.remove('bg-yellow-400');
        }
        else if (weatherWidget.classList.contains('bg-gray-200')) {
            weatherWidget.classList.remove('bg-gray-200');
        }
        else if (weatherWidget.classList.contains('bg-white')) {
            weatherWidget.classList.remove('bg-white');
        }
    } else if (description.includes('mist')) {
        weatherWidget.classList.add('bg-gray-400');
        if (weatherWidget.classList.contains('bg-yellow-400')) {
            weatherWidget.classList.remove('bg-yellow-400');
        }
        else if (weatherWidget.classList.contains('bg-blue-400')) {
            weatherWidget.classList.remove('bg-blue-400');
        }
        else if (weatherWidget.classList.contains('bg-gray-200')) {
            weatherWidget.classList.remove('bg-gray-200');
        }
        else if (weatherWidget.classList.contains('bg-white')) {
            weatherWidget.classList.remove('bg-white');
        }
    } else {
        weatherWidget.classList.add('bg-white');
        if (weatherWidget.classList.contains('bg-gray-400')) {
            weatherWidget.classList.remove('bg-gray-400');
        }
        else if (weatherWidget.classList.contains('bg-blue-400')) {
            weatherWidget.classList.remove('bg-blue-400');
        }
        else if (weatherWidget.classList.contains('bg-gray-200')) {
            weatherWidget.classList.remove('bg-gray-200');
        }
        else if (weatherWidget.classList.contains('bg-yellow-400')) {
            weatherWidget.classList.remove('bg-yellow-400');
        }
    }

}         

function updateTemperatureDisplay(temperature) {
    if (currentUnit === 'metric') {
        document.getElementById('temperature').textContent = `Temperature: ${temperature} °C`;
    } else {
        document.getElementById('temperature').textContent = `Temperature: ${(temperature * 9/5 + 32).toFixed(2)} °F`;
    }
}

function fetchWeatherForLocation(lat, lon) {
    spinner.style.display = 'flex';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            updateWeatherWidget(data);
            spinner.style.display = 'none';
        })
        .catch(error => console.error('Error fetching weather data:', error));
        
    const url2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url2)
        .then(response => response.json())
        .then(data => {
            updateCharts(data);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function getLocation() {
    if ("geolocation" in navigator) {
        console.log("Geolocation is available");
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Please allow location access to view weather information based on your location.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}


function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherForLocation(lat, lon);
}
getLocation();
