# Viixet
A NodeJS/Express - VueJS full-stack template for small projects or just for learning.

The idea is to have a single node-express server that provides the Vue based frontend and also all the backend routes. Usually I found these are separate and the backend has to handle CORS, which I don't want to do in most of my projects.

## Database
The Viixet database is designed just for the users and for anything else create a separate database. You can still connect users to your data for example:
`LEFT JOIN viixet.User user ON user.viixetId = post.viixetId`

The database is also fairly simple to replace to whatever you want if MySQL is not your cup of tea. Just replace the Viixet MySQL based methods with your own.

## Depedencies
- NodeJS & NPM packet manager
- MySQL database and server

## Installation
1. Load ZIP or checkout from github
2. Run the viixet-mysql.sql script to create the database
    - Create an environment file .env and follow the provided .env_sample style for DB settings
3. In the extracted location, run: `npm install`, `npm run sass`, `npm run build` and `npm run server`
4. In your browser go to localhost:3000 and the app should be running

## Tips
I use VS Code and the Git bash as a integrated terminal in the editor. It makes it easy to jump from the code to running commands.
