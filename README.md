# Users microservice

Microservice for handling actions with users on [Express.js](https://expressjs.com/) and [MongoDB](https://www.mongodb.com)

## Prerequisites
- [Node.js](https://nodejs.org/en)
- [NPM](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com)
- [Docker](https://www.docker.com)

## Routes
### Register
- ```http://localhost:3006/users/register```
- Method: **POST**
- Request body (in JSON, all field required): 
    1. username
    2. email
    3. password
- Response (In [JSON](https://www.w3schools.com/whatis/whatis_json.asp))
    1. "message"
    2. "token" (JWT)

 ## Login
- ```http://localhost:3006/users/login```
- Method: **POST**
- Request body: 
    1. email
    2. password
- Response
    1. "success" (boolean value)
    2. "message"

 ## Auto-login via JWT
- ```http://localhost:3006/users/login_jwt```
- Method: **GET**
- Request headers must contain key-value pair:
 - Key: Authorization
 - Value: `Bearer ${JWT}`
- Response
    1. "success" (boolean value)
    2. "message"

## Delete user
- ```http://localhost:3006/users/delete```
- Method: **DELETE**
- Request headers must contain key-value pair:
 - Key: Authorization
 - Value: `Bearer ${JWT}`

  ## Update username
- ```http://localhost:3006/users/login_jwt```
- Method: **PUT**
- Request headers must contain key-value pair:
 - Key: Authorization
 - Value: `Bearer ${JWT}`
- Request body: 
    1. new_username
- Response
    1. "success" (boolean value)
    2. "message"

## Start developing
### Fill .env
- Generate JWT
    - Run in terminal ```openssl rand -base64 64```
- Set JWT expire time (or leave default value, 24hours)
### Install dependencies locally
- Run ```npm install```
### Connect to DB
- Put your mongoURI from MongoDB in *database.js*
### Start local server
- Run ```node index.js```

## Run in Docker container
### Build docker container
- ```sudo docker build -t users-service .```
### Run docker container
- ```sudo docker run -p 3005:3006 users-service```

If you run service in Docker, you should make requests to http://localhost:3005/users