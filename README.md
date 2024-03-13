# Domain-Driven Hexagon With MongoDB

## Changes 
1- Replacing postgres with mongodb container.<br>
2- Changing Base sql repository with base mongodb repository.<br>
3- Refactoring users and wallets repository ti work with prisma and mongodb. <br>
4- Refactoring Query and Command Handlers. <br>
5- Changing package.json scripts for migration and seeding. <br>


## How to run the server
1- got to docker folder and run `docker compose up -d`.<br>
2- go back to root folder of the project and run `pnpm i` to install dependencies.<br>
3- Copy the content of the .env.example file and create a .env file an paste the data into it.<br>
4- run `pnpm start:dev` to run the server. If you see this `Swagger server is up and running on : http://localhost:3000/documentation` message, server is running fine. You can use Swagger api page to explore apis.<br>
