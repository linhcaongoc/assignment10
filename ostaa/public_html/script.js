/*
Script for main page
*/

function createAccount(event) {
    event.preventDefault();

    const username = document.getElementById('create-username').value;
    const password = document.getElementById('create-password').value;

    const httpRequest = new XMLHttpRequest();
    const url = '/add/user';
    const data = { username: username, password: password };
    const jsonData = JSON.stringify(data);

    httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const response = httpRequest.responseText;
                const message = document.getElementById('create-message');
                message.innerText = 'Successfully saved user';
                message.style.display = 'block';

                const usernameField = document.getElementById('create-username');
                const passwordField = document.getElementById('create-password');
                usernameField.value = '';
                passwordField.value = '';

                console.log('Successfully saved user', response);
            } else {
                const errorMessage = document.getElementById('create-message');
                errorMessage.innerText = 'Error creating user';
                errorMessage.style.display = 'block';
                console.error('Error creating user:', httpRequest.statusText);
            }
        }
    };

    httpRequest.send(jsonData);
}

function login(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const httpRequest = new XMLHttpRequest();
    const url = '/login';
    const data = { username: username, password: password };
    const jsonData = JSON.stringify(data);

    httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    httpRequest.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            // Login successful, get the username from the response
            const responseData = JSON.parse(this.responseText);
            const username = responseData.user.username;

            // Save the username in localStorage
            localStorage.setItem('username', username);

            // Redirect to home.html
            window.location.href = '/home.html';
        } else {
            // Display an error message
            const errorMessage = document.getElementById('login-message');
            errorMessage.innerText = 'Invalid login credentials';
            errorMessage.style.display = 'block';
        }
    }

    httpRequest.send(jsonData);
};

function addItem(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const image = document.getElementById('image').value;
    const price = document.getElementById('price').value;
    const status = document.getElementById('status').value;
    const username = localStorage.getItem('username');

    const httpRequest = new XMLHttpRequest();
    const url = '/add/item/' + username;
    const data = { title: title, description: description, image: image, price: price, stat: status };
    const jsonData = JSON.stringify(data);

    httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const response = httpRequest.responseText;
                // Redirect to home.html
                window.location.href = '/home.html';
                console.log('Successfully saved item', response);
            } else {
                console.error('Error saving item:', httpRequest.statusText);
            }
        }
    };

    httpRequest.send(jsonData);
}

function searchItems(event) {
    event.preventDefault();

    const searchInput = document.getElementById('search-input').value;
    const searchResultsContainer = document.getElementById('search-results-container');

    const httpRequest = new XMLHttpRequest();
    const url = '/search/items/' + encodeURIComponent(searchInput);

    httpRequest.open('GET', url);

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const items = JSON.parse(httpRequest.responseText);
                searchResultsContainer.innerHTML = '';

                items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'search-result-item';

                    const title = document.createElement('h3');
                    title.textContent = item.title;

                    const description = document.createElement('p');
                    description.textContent = item.description;

                    const price = document.createElement('p');
                    price.textContent = 'Price: $' + item.price;

                    itemDiv.appendChild(title);
                    itemDiv.appendChild(description);
                    itemDiv.appendChild(price);

                    if (item.stat == 'SALE') {
                        const buyButton = document.createElement('button');
                        buyButton.textContent = 'Buy Now';
                        buyButton.addEventListener('click', () => {
                            buyItem(item);
                        });
                        itemDiv.appendChild(buyButton);
                    } else {
                        const soldText = document.createElement('p');
                        soldText.textContent = 'SOLD';
                        itemDiv.appendChild(soldText);
                    }

                    searchResultsContainer.appendChild(itemDiv);
                });
            } else {
                console.error('Error fetching search results:', httpRequest.statusText);
            }
        }
    };

    httpRequest.send();
}

function displayUsername() {
    const username = localStorage.getItem('username');

    if (username) {
        const welcomeMessage = document.getElementById('welcome');
        welcomeMessage.innerText = `Welcome, ${username}! What would you like to do?`;
    }
}

function viewPurchases() {
    const searchResultsContainer = document.getElementById('search-results-container');

    const httpRequest = new XMLHttpRequest();
    const username = localStorage.getItem('username');
    const url = '/get/purchases/' + username;

    httpRequest.open('GET', url);

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const items = JSON.parse(httpRequest.responseText);
                searchResultsContainer.innerHTML = '';

                items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'search-result-item';

                    const title = document.createElement('h3');
                    title.textContent = item.title;

                    const description = document.createElement('p');
                    description.textContent = item.description;

                    const price = document.createElement('p');
                    price.textContent = 'Price: $' + item.price;

                    itemDiv.appendChild(title);
                    itemDiv.appendChild(description);
                    itemDiv.appendChild(price);

                    const soldText = document.createElement('p');
                    soldText.textContent = 'Item has been purchased';
                    itemDiv.appendChild(soldText);


                    searchResultsContainer.appendChild(itemDiv);
                });
            } else {
                console.error('Error fetching items:', httpRequest.statusText);
            }
        }
    };

    httpRequest.send();
}

function viewListings() {
    const searchResultsContainer = document.getElementById('search-results-container');

    const httpRequest = new XMLHttpRequest();
    const username = localStorage.getItem('username');
    const url = '/get/listings/' + username;

    httpRequest.open('GET', url);

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const items = JSON.parse(httpRequest.responseText);
                searchResultsContainer.innerHTML = '';

                items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'search-result-item';

                    const title = document.createElement('h3');
                    title.textContent = item.title;

                    const description = document.createElement('p');
                    description.textContent = item.description;

                    const price = document.createElement('p');
                    price.textContent = 'Price: $' + item.price;

                    itemDiv.appendChild(title);
                    itemDiv.appendChild(description);
                    itemDiv.appendChild(price);
                    console.log(item)

                    if (item.stat == 'SALE') {
                        const buyButton = document.createElement('button');
                        buyButton.textContent = 'Buy Now';
                        buyButton.addEventListener('click', () => {
                            buyItem(item);
                        });
                        itemDiv.appendChild(buyButton);
                    } else {
                        const soldText = document.createElement('p');
                        soldText.textContent = 'SOLD';
                        itemDiv.appendChild(soldText);
                    }

                    searchResultsContainer.appendChild(itemDiv);
                });
            } else {
                console.error('Error fetching items:', httpRequest.statusText);
            }
        }
    };

    httpRequest.send();
}

async function buyItem(item) {
    const itemId = item._id;
    const username = localStorage.getItem('username');

    try {
        const response = await fetch(`/purchase/${itemId}/${username}`, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        alert('Item purchased successfully!');
        location.reload(); // Reload the page to update the items' status
    } catch (error) {
        alert('Error purchasing item: ' + error);
    }
}

// Call the displayUsername function when the page loads
document.addEventListener('DOMContentLoaded', displayUsername);
