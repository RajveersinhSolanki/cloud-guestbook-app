const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'messages.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize storage file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Frontend HTML template served on root request
app.get('/', (req, res) => {
    const messages = JSON.parse(fs.readFileSync(DATA_FILE));
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Cloud Guestbook App</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f4f7f6; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
            input, textarea { width: 100%; padding: 8px; margin: 8px 0; box-sizing: border-box; }
            button { background: #007BFF; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 4px; }
            button:hover { background: #0056b3; }
            ul { padding-left: 20px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Cloud Guestbook Deployment</h2>
            <form action="/submit" method="POST">
                <label>Your Name:</label>
                <input type="text" name="name" required />
                <label>Message:</label>
                <textarea name="message" rows="3" required></textarea>
                <button type="submit">Post Message</button>
            </form>
        </div>
        <div class="card">
            <h3>Recent Visitor Messages:</h3>
            <ul>
    `;
    
    messages.forEach(m => {
        html += `<li><strong>${m.name}</strong>: ${m.message} <em>(${m.date})</em></li>`;
    });

    html += `
            </ul>
        </div>
    </body>
    </html>
    `;
    res.send(html);
});

// Handle form submission and storage
app.post('/submit', (req, res) => {
    const { name, message } = req.body;
    const messages = JSON.parse(fs.readFileSync(DATA_FILE));
    
    messages.unshift({ name, message, date: new Date().toLocaleString() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
    
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});