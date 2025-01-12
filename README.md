
# Didula MD Song Bot

![Logo](https://i.giphy.com/6FjaNxfq8vHSQI0aVm.webp)

**Owner:** Didula Rashmika  
**WhatsApp Number:** [<img src='https://img.shields.io/badge/Contact%20Me-94771820962-blue?style=for-the-badge&logo=whatsapp&logoColor=white' width=115 height=28 />](https://wa.me/94771820962)  
**WhatsApp Channel:** [<img src='https://img.shields.io/badge/Join%20Channel-WhatsApp-orange?style=for-the-badge&logo=whatsapp&logoColor=white' width=115 height=28 />](https://whatsapp.com/channel/0029VaqqF4GDTkJwKruLSK2f)  
**Bot Testing Group:** [<img src='https://img.shields.io/badge/Join%20Group-WhatsApp-green?style=for-the-badge&logo=whatsapp&logoColor=white' width=115 height=28 />](https://chat.whatsapp.com/Cqz3YYSAfFZJD0lMpyvuzl)  
**Repo URL:** [<img src='https://img.shields.io/badge/GitHub%20Repo-black?style=for-the-badge&logo=github&logoColor=white' width=115 height=28 />](https://github.com/itsme-didulabot/Didula-MD-Song-Bot-V1)

# ⚠️Work only in Groups 

## Overview

Didula MD Song Bot is an automated bot designed to send songs to WhatsApp groups effortlessly. 

## Features

- Automatically sends songs to WhatsApp groups.
- Easy to deploy on various platforms.



### Step 1: Get the Session ID

1. **Access the URL**: Open your browser and navigate to [https://prabath-md-pair-web-v2-slk.koyeb.app/pair](https://prabath-md-pair-web-v2-slk.koyeb.app/pair).
2. **Obtain the Session ID**: After accessing the URL, you should see a session ID displayed. Copy this session ID.

### Step 2: Remove the Prefix

- If your session ID looks something like `PRABATH-MD~123456`, you need to remove the prefix (`PRABATH-MD~`) to get just the numerical part (e.g., `123456`).

### Step 3: Add Session ID to Config.js

1. **Open your project**: Navigate to your bot's project directory where the `config.js` file is located.
2. **Edit config.js**: Open the `config.js` file in a text editor




## Installation

To run the bot locally, follow these steps:

1. Clone this repository:
   ```bash
   git clone https://github.com/itsme-didulabot/Didula-MD-Song-Bot-V1
   ```
2. Navigate to the project directory:
   ```bash
   cd Didula-MD-Song-Bot-V1
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Configure the bot with your WhatsApp number and any other necessary settings.

5. Run the bot:
   ```bash
   npm start
   ```

## Deployment

You can deploy this bot for free on the following platforms:

[<img src='https://img.shields.io/badge/Deploy%20to%20Heroku-purple?style=for-the-badge&logo=heroku&logoColor=white' width=150 height=28 />](https://heroku.com/deploy?template=https://github.com/itsme-didulabot/Didula-MD-Song-Bot-V1)

[<img src='https://img.shields.io/badge/Deploy%20to%20Replit-blue?style=for-the-badge&logo=replit&logoColor=white' width=150 height=28 />](https://replit.com/github/itsme-didulabot/Didula-MD-Song-Bot-V1)

[<img src='https://img.shields.io/badge/Deploy%20to%20Glitch-grey?style=for-the-badge&logo=glitch&logoColor=white' width=150 height=28 />](https://glitch.com/edit/#!/import/github/itsme-didulabot/Didula-MD-Song-Bot-V1)

### GitHub Actions Workflows

#### Node.js CI

You can set up a continuous integration workflow by creating a `.github/workflows/nodejs.yml` file with the following content:

```yaml
name: Node.js CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install dependencies
      run: npm install

    - name: Start application
      run: npm start
```

#### Deploy to Heroku

You can also set up automatic deployment using GitHub Actions. Create a `.github/workflows/deploy.yml` file with the following content:

```yaml
name: Deploy to Heroku

on:
  push:
    branches:
      - main  # Set the branch you want to deploy from

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'  # Specify the Node.js version

    - name: Install dependencies
      run: npm install

    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.8.8
      with:
        heroku_app_name: 'YOUR_HEROKU_APP_NAME'  # Replace with your Heroku app name
        heroku_email: 'YOUR_HEROKU_EMAIL'  # Replace with your Heroku email
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}  # Set this in your GitHub secrets
```

Make sure to replace `YOUR_HEROKU_APP_NAME` and `YOUR_HEROKU_EMAIL` with your actual Heroku app name and email. Also, you will need to add your Heroku API key to the GitHub repository secrets under the name `HEROKU_API_KEY`.

## Contributing

Feel free to fork the repository and submit pull requests.

<a href='https://github.com/itsme-didulabot/Didula-MD-Song-Bot-V1/fork' target="_blank">
  <img alt='Fork Repo' src='https://img.shields.io/badge/-Fork_Repo-grey?style=for-the-badge&logo=github&logoColor=white' width=150 height=28 />
</a>

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any inquiries, please contact Didula Rashmika.
