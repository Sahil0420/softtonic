# Ecommerce Backend
It's a node js server with ExpressJs. MongoDB schemas are designed to store the information about the products and its variants and pricing. There are some API endpoint are created which can **add product , update variants , and get the info of product using its id.** There are also two API endpoints for **login and register**. Only Authenticated users can visit the */products* api's as they are protected using a custome middleware.

## Prerequisites
1. MongoDB or Atlas URL
2. Nodejs installed
3. npm or yarn or bun any package manager must be installed
4. [Postman](https://www.postman.com/) - A lightweight api client which can be used to test api without creating a frontend. You can use any API client according to your need.

## Steps to setup up this project in your local space.
1. Run the following command in your command line.
```bash
   git clone https://github.com/Sahil0420/softtonic.git
   # when cloned completely
   cd softtonic
   ```
2. To install the packages used in the project you have use any package manager like bun or npm. The following command will install all the dependencies mentioned in package.json file.
  ```bash
  bun install
  # or
  npm install
  ```
3. There is an index.js file which is the main file of this project . When you run node index.js file it will start a server running on a specified port 3000 . You can change the port number if it is already busy. Nodemon is used in the used project which have auto restart feature it is helpful during the development but it can also work even if the project is completed. **Nodemon automatically detects the index.js file and run it.**
- Run any one command to start the server.
```bash
npx nodemon
or
bunx nodemon
or
node index.js
or
bun index.js
```
4. If your MongoDB is running locally it will connect to it. There is no need to create database and collections , they will be automatically created if api endpoints are used.

5. To check that your server

## 1. Create a product
  - **Endpoint** : POST /products
  - **Description** : Creates a new product with variants.
  - **Request Body Example**
```json
{
  "name": "T-Shirt",
  "variants": [
    {
      "color": "Red",
      "size": "M",
      "price": 2000
    },
    {
      "color": "Blue",
      "size": "L",
      "price": 2500
    }
  ]
}
```
  - **Response**
    - 201 Created
    - ```json
      {"message": "product successfully saved"}
      ```
    - 400 bad request
    - ```json
      {"message":"Error message"}
      ```

## 2.  
