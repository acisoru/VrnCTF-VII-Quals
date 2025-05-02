function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

async function checkLoginStatus() {
    try {
        const response = await fetch('/me', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}

async function generateHeader() {
    // TODO: Remove admin.html from header - done

    const isLoggedIn = await checkLoginStatus();
    if (isLoggedIn) {
        document.getElementById('header').innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/home.html">⚓ Помощник Капитана</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/account.html">Мой аккаунт</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#" onclick="logout()">Выход</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    } else {
        document.getElementById('header').innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/index.html">⚓ Помощник Капитана</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/login.html">Авторизация</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/signup.html">Регистрация</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    }
}

function logout() {
    fetch('/logout', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                window.location.href = '/index.html';
            } else {
                console.error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
}