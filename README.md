## ⚙️ Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/Pankaj2612/CryptoCrashBackend.git
cd CryptoCrashBackend

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env file in the root directory and add the following:


MONGO_URI=mongodb://localhost:27017/crypto-crash"
EXCHANGE_API_KEY = "Use coinmarketCap API Key"

# 4. Start the development server
node server.js
or
nodemon server.js

#5.If Cors error then
Add your Frontend URL to cors in server.js
# Server will run on http://localhost:3000 by default
```
