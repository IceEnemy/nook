
## How to Clone the repository

make sure you have svelte and node in your workstation!

```bash
git clone https://github.com/IceEnemy/nook.git
```

after cloning the project, make sure to install all dependencies!

```bash
cd project-directory

npm install
```

## Testing the application

right now, it has been tested on the dev build only, so

```bash
npm run dev
```

if you encounter any routing errors, restart the server by typing

```bash
r
```

when the application is running

## .env file

in your .env file, ensure that you have these private firebase and openai keys:

```bash
VITE_API_KEY
VITE_AUTH_DOMAIN
VITE_PROJECT_ID
VITE_STORAGE_BUCKET
VITE_MESSAGING_SENDER_ID
VITE_APP_ID
VITE_MEASUREMENT_ID
VITE_DATABASE_URL
VITE_OPENAI_API_KEY
```
