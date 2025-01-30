// Fetch data from travel_recommendation_api.json
async function fetchTravelRecommendations() {
    try {
        const response = await fetch('travel_recommendation_api.json'); // Fetch JSON file
        const data = await response.json(); // Convert to JSON
        console.log("Fetched Data:", data); // Debugging
        return data;
    } catch (error) {
        console.error("Error fetching travel recommendations:", error);
        return null;
    }
}

// Normalize search term (convert to lowercase and handle plural variations)
function normalizeKeyword(keyword) {
    keyword = keyword.toLowerCase();

    // Handle plural variations
    if (keyword.endsWith("es")) {
        return keyword.slice(0, -2); // beaches → beach
    } else if (keyword.endsWith("s")) {
        return keyword.slice(0, -1); // temples → temple
    }
    return keyword;
}

// Get current time for a specific time zone
function getCurrentTime(timeZone) {
    const options = {
        timeZone: timeZone,
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    };
    return new Date().toLocaleTimeString('en-US', options);
}

// Filter recommendations based on keyword
function filterRecommendations(data, keyword) {
    keyword = normalizeKeyword(keyword);
    let results = [];

    if (keyword === "beach") {
        results = data.beaches;
    } else if (keyword === "temple") {
        results = data.temples;
    } else if (keyword === "country") {
        // Flatten country and city data into one array
        results = data.countries.flatMap(country =>
            country.cities.map(city => ({
                name: city.name,
                imageUrl: city.imageUrl,
                description: city.description,
                timeZone: city.timeZone // Add timeZone to the city object
            }))
        );
    } else {
        // Search country names and cities
        results = data.countries.flatMap(country => 
            country.cities.filter(city => 
                city.name.toLowerCase().includes(keyword) || 
                country.name.toLowerCase().includes(keyword)
            ).map(city => ({
                name: city.name,
                imageUrl: city.imageUrl,
                description: city.description,
                timeZone: city.timeZone // Add timeZone to the city object
            }))
        );
    }

    // Ensure at least two results, slice if needed
    return results.length >= 2 ? results.slice(0, 2) : results;
}

// Function to display recommendations
function displayRecommendations(results) {
    const resultsContainer = document.getElementById('recommendationResults');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found. Try another search.</p>';
        return;
    }

    results.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.classList.add('recommendation-card');

        // Get current time for the place's time zone
        const currentTime = place.timeZone ? getCurrentTime(place.timeZone) : "Time zone not available";

        placeCard.innerHTML = `
            <img src="${place.imageUrl}" alt="${place.name}">
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <p><strong>Current Time:</strong> ${currentTime}</p>
        `;

        resultsContainer.appendChild(placeCard);
    });
}

// Function to clear search results and input
function clearResults() {
    document.getElementById('searchInput').value = ''; // Clear the search input
    document.getElementById('recommendationResults').innerHTML = ''; // Clear the results
}

// Handle search functionality
document.getElementById('searchButton').addEventListener('click', async function () {
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (!searchTerm) {
        alert("Please enter a search term.");
        return;
    }

    const data = await fetchTravelRecommendations();
    if (!data) return;

    const filteredResults = filterRecommendations(data, searchTerm);
    displayRecommendations(filteredResults);
});

// Handle reset functionality
document.getElementById('resetButton').addEventListener('click', function () {
    clearResults(); // Call the clearResults function
    alert('Search results cleared.');
});