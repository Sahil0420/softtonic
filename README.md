# Ecommerce Backend
It's a node js server with ExpressJs. MongoDB schemas are designed to store the information about the products and its variants and pricing. There are some API endpoint are created which can **add product , update variants , and get the info of product using its id.** There are also two API endpoints for **login and register**. Only Authenticated users can visit the */products* api's as they are protected using a custome middleware.

## Prerequisites
1. MongoDB or Atlas URL
2. Nodejs installed
3. npm or yarn or bun any package manager must be installed
4. [Postman](https://www.postman.com/) - A lightweight api client which can be used to test api without creating a frontend. You can use any API client according to your need.

## Steps to setup this project in your local space.
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

5. To check that your server is running correctly open your api client or any browser and write `localhost:3000/` in your seearch bar it will show **Hello** on the screen.

## API Documentation
#### Server is running at [localhost:3000](http://localhost:3000/).

##### 1. Register
- **Endpoint** : POST $\quad$ /auth/register
- **Description** : This route is used to create a new user account in the mongodb. It requires parameters like name , email (unique) and password. Password will be encrypted before saving into the database.
- ***Request Body Example**
```json
{
  "name" : "sahil",
  "email" : "sahil@gmail.com"
  "password" : "password"
}
```

#### 2. Login
- **Endpoint** : POST $\quad$ /auth/login
- **Description** : This route is used to login into an existing account . If there is no account error will be returned through json response with http code 500.
- **Request Body Example**
```json
{
   "email":"sahil@gmail.com",
   "password" : "password"
}
```
- You wll get a jwt signed authorization token if logged in successfuly. This authorization token must be present in your http requests header in order to access the autheticated routes. 

#### 3. Create a product
  - **Endpoint** : POST $\quad$ /products
  - **Description** : Creates a new product with variants. Authentication is required to use this route. To use this route uer have to create an account and log in to it and your authorization token must be present in  your http header.
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
```json
   {"message": "product successfully saved"}
```
 - 400 bad request
```json
   {"message":"Error message"}
```

#### 4. Fetch Product Details
- **Endpoint** : GET $\quad$ /products/:id
- **Description** : This API endpoint fetches the specific product's details with all variants. This is also an authentication protected route therefore logged in account is required.
- **Request Example**
```json
http://localhost:3000/products/67af8439d3940e79af94f274
```
- id of the product could be different **:id** refers to the dynamic part of the url.  Therefore there will be different results for the different valid id.
- If the product id is not present in the collection or table . Error message will be return through json response with http status code 400 and any other error caught in catch will be returned with status code 500.

#### 5. Update the Product Variants
- **Endpoint** : PUT $\quad$ /products/:id
- **Description** : This API endpoint is used to update the variants of the specified products. It required
- **Request Example**
```json
http://localhost:3000/products/67af8439d3940e79af94f274
```
- **Request Body Example**
```json
   {
    "name": "Jeans",
    "variants": [
      {
        "color": "Blue",
        "size": "32",
        "price": 3500
      },
      {
        "color": "Black",
        "size": "34",
        "price": 3700
      },
      {
        "color": "Gray",
        "size": "30",
        "price": 3300
      }
    ]
  },
```
- If the product not found it can't be updated therefore error `Product Not Found` will be returned with status code 404.
- If updating product get successful the updated product json will be returned as `{new : true}` parameter is passed in the `findByIdAndUpdate()` method. This will return the product new updated version i n the result.
- Other internal error will be returned from catch block with status code 400.
