// Конфигурация сервера
const serverConfig = {
    host: 'localhost',
    port: '8080',
    get baseUrl() {
        return `http://${this.host}:${this.port}`;
    }
};

// Состояние приложения
const appState = {
    isConnected: false,
    isChecking: false
};

// Основная функция инициализации
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация приложения...');

    try {
        initializeApp();
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        showError('Ошибка инициализации приложения', error.message);
    }
});

function initializeApp() {
    // Получаем элементы DOM
    const elements = {
        connectionStatus: document.getElementById('connectionStatus'),
        testConnectionBtn: document.getElementById('testConnectionBtn'),
        sendBtn: document.getElementById('sendBtn'),
        simpleBtn: document.getElementById('simpleBtn'),
        countBtn: document.getElementById('countBtn'),
        userMessage: document.getElementById('userMessage'),
        responseArea: document.getElementById('responseArea'),
        responseText: document.getElementById('responseText'),
        statusInfo: document.getElementById('statusInfo'),
        errorDetails: document.getElementById('errorDetails'),
        connectionHelp: document.getElementById('connectionHelp'),
        serverHost: document.getElementById('serverHost'),
        serverPort: document.getElementById('serverPort')
    };

    // Проверяем, что все элементы найдены
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            throw new Error(`Элемент ${key} не найден в DOM`);
        }
    }

    // Сохраняем элементы в глобальной области видимости
    window.appElements = elements;

    // Назначаем обработчики событий
    elements.testConnectionBtn.addEventListener('click', handleTestConnection);
    elements.sendBtn.addEventListener('click', handleSendMessage);
    elements.simpleBtn.addEventListener('click', handleSimpleRequest);
    elements.countBtn.addEventListener('click', handleGetCount);

    elements.userMessage.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !elements.sendBtn.disabled) {
            handleSendMessage();
        }
    });

    elements.serverHost.addEventListener('input', handleConfigChange);
    elements.serverPort.addEventListener('input', handleConfigChange);

    console.log('Приложение инициализировано успешно');
    updateUI();
}

function handleConfigChange() {
    console.log('Конфигурация изменена');
    appState.isConnected = false;
    updateUI();
    hideErrorMessages();
}

function handleTestConnection() {
    console.log('Проверка подключения...');
    testConnection();
}

function handleSendMessage() {
    console.log('Отправка сообщения...');
    sendToServer();
}

function handleSimpleRequest() {
    console.log('Простой запрос...');
    getSimpleString();
}

function handleGetCount() {
    console.log('Получение счетчика...');
    getCount();
}

function updateUI() {
    const { connectionStatus, sendBtn, simpleBtn, countBtn, responseText } = window.appElements;

    if (appState.isChecking) {
        connectionStatus.textContent = 'Проверка...';
        connectionStatus.className = 'connection-status checking';
        responseText.innerHTML = '<span class="loading">⏳ Проверка подключения к серверу...</span>';
    } else if (appState.isConnected) {
        connectionStatus.textContent = 'Подключено';
        connectionStatus.className = 'connection-status connected';
        sendBtn.disabled = false;
        simpleBtn.disabled = false;
        countBtn.disabled = false;
    } else {
        connectionStatus.textContent = 'Не подключено';
        connectionStatus.className = 'connection-status disconnected';
        sendBtn.disabled = true;
        simpleBtn.disabled = true;
        countBtn.disabled = true;
        responseText.textContent = 'Сначала проверьте подключение к серверу...';
    }
}

function hideErrorMessages() {
    const { errorDetails, connectionHelp } = window.appElements;
    errorDetails.style.display = 'none';
    connectionHelp.style.display = 'none';
    errorDetails.innerHTML = '';
}

function showError(title, message) {
    const { responseArea, responseText, statusInfo, errorDetails, connectionHelp } = window.appElements;

    responseText.innerHTML = `<span class="error-message">❌ ${title}</span>`;
    responseArea.className = 'response-area error';
    statusInfo.textContent = message;

    errorDetails.innerHTML = `
        <strong>Детали ошибки:</strong><br>
        ${message}
        <button class="retry-btn" onclick="testConnection()">🔄 Попробовать снова</button>
    `;
    errorDetails.style.display = 'block';
    connectionHelp.style.display = 'block';
}

function showSuccess(message, additionalInfo = '') {
    const { responseArea, responseText, statusInfo } = window.appElements;

    responseText.innerHTML = `<span class="success-message">✅ ${message}</span>`;
    responseArea.className = 'response-area success';
    statusInfo.textContent = additionalInfo;
}

async function testConnection() {
    console.log('Начало проверки подключения...');

    const { serverHost, serverPort } = window.appElements;

    // Обновляем конфигурацию
    serverConfig.host = serverHost.value;
    serverConfig.port = serverPort.value;

    console.log('Проверяем URL:', serverConfig.baseUrl);

    // Обновляем UI
    appState.isChecking = true;
    appState.isConnected = false;
    updateUI();
    hideErrorMessages();

    const { testConnectionBtn } = window.appElements;
    testConnectionBtn.disabled = true;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        console.log('Отправляем запрос к /test...');
        const response = await fetch(`${serverConfig.baseUrl}/test`, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain, */*'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('Получен ответ:', response.status, response.statusText);

        if (response.ok) {
            const text = await response.text();
            console.log('Ответ сервера:', text);

            appState.isConnected = true;
            appState.isChecking = false;
            showSuccess('Сервер доступен!', `Ответ: ${text}<br>Адрес: ${serverConfig.baseUrl}`);
        } else {
            throw new Error(`HTTP ошибка: ${response.status} ${response.statusText}`);
        }

    } catch (error) {
        console.error('Ошибка подключения:', error);

        appState.isChecking = false;
        appState.isConnected = false;

        let errorMessage = 'Неизвестная ошибка';

        if (error.name === 'AbortError') {
            errorMessage = `Таймаут подключения. Сервер не ответил в течение 5 секунд по адресу ${serverConfig.baseUrl}`;
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = `Сетевая ошибка. Не удалось установить соединение с ${serverConfig.baseUrl}`;
        } else {
            errorMessage = error.message;
        }

        showError('Не удалось подключиться к серверу', errorMessage);
    } finally {
        updateUI();
        testConnectionBtn.disabled = false;
    }
}

async function sendToServer() {
    if (!appState.isConnected) {
        showError('Ошибка', 'Сначала установите подключение к серверу');
        return;
    }

    const { userMessage } = window.appElements;
    const message = userMessage.value;

    console.log('Отправка сообщения:', message);

    showSuccess('Отправка запроса...', '');

    try {
        const response = await fetch(`${serverConfig.baseUrl}/get-string`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            body: message || ''
        });

        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Ответ от сервера:', data);

        showSuccess('Сообщение отправлено!', `
            Время: ${data.timestamp}<br>
            Счётчик: ${data.clickCount}<br>
            Статус: ${data.status}
        `);

    } catch (error) {
        console.error('Ошибка отправки:', error);
        showError('Ошибка при отправке сообщения', error.message);
    }
}

async function getSimpleString() {
    if (!appState.isConnected) {
        showError('Ошибка', 'Сначала установите подключение к серверу');
        return;
    }

    console.log('Запрос простой строки...');

    showSuccess('Запрос простой строки...', '');

    try {
        const response = await fetch(`${serverConfig.baseUrl}/get-simple-string`);

        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        console.log('Простой ответ:', text);

        showSuccess('Простой ответ получен!', `Время: ${new Date().toLocaleTimeString()}`);

    } catch (error) {
        console.error('Ошибка запроса:', error);
        showError('Ошибка при получении простой строки', error.message);
    }
}

async function getCount() {
    if (!appState.isConnected) {
        showError('Ошибка', 'Сначала установите подключение к серверу');
        return;
    }

    console.log('Запрос счетчика...');

    showSuccess('Запрос счетчика...', '');

    try {
        const response = await fetch(`${serverConfig.baseUrl}/get-count`);

        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Данные счетчика:', data);

        showSuccess('Счетчик получен!', `
            Текущее значение: <strong>${data.count}</strong><br>
            Обновлено: ${new Date().toLocaleTimeString()}
        `);

    } catch (error) {
        console.error('Ошибка запроса:', error);
        showError('Ошибка при получении счетчика', error.message);
    }
}

// Глобальные функции для отладки
window.debugApp = function() {
    console.log('Состояние приложения:', appState);
    console.log('Конфигурация сервера:', serverConfig);
    console.log('Элементы DOM:', window.appElements);
};

window.forceTestConnection = function() {
    testConnection();
};