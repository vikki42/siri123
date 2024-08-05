document.addEventListener('DOMContentLoaded', () => {
    const chatDisplay = document.getElementById('chat-display');
    const inputEntry = document.getElementById('input-entry');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const plotBtn = document.getElementById('plot-btn');
    const fileUpload = document.getElementById('file-upload');

    sendBtn.addEventListener('click', sendMessage);
    inputEntry.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    uploadBtn.addEventListener('click', () => fileUpload.click());
    fileUpload.addEventListener('change', uploadFile);
    plotBtn.addEventListener('click', plotData);

    voiceBtn.addEventListener('click', () => {
        voiceBtn.classList.toggle('listening');
        // Add logic here to start/stop voice recognition
    });

    function sendMessage() {
        const message = inputEntry.value.trim();
        if (!message) return;

        displayMessage(message, 'user');
        inputEntry.value = '';

        fetch('http://localhost:5000/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            displayMessage(data.response, 'assistant');
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage('Error: ' + error.message, 'assistant');
        });
    }

    function displayMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = sender;
        messageElement.textContent = `${sender === 'user' ? 'You' : 'Assistant'}: ${message}`;
        chatDisplay.appendChild(messageElement);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    function uploadFile() {
        const file = fileUpload.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        fetch('http://localhost:5000/upload_file', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            displayMessage(data.message, 'assistant');
        })
        .catch(error => console.error('Error:', error));
    }

    function plotData() {
        fetch('http://localhost:5000/plot_data')
        .then(response => response.json())
        .then(data => {
            if (data.plot) {
                const img = document.createElement('img');
                img.src = `data:image/png;base64,${data.plot}`;
                chatDisplay.appendChild(img);
                chatDisplay.scrollTop = chatDisplay.scrollHeight;
            } else {
                displayMessage(data.error, 'assistant');
            }
        })
        .catch(error => console.error('Error:', error));
    }
});
