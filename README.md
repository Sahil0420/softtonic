# softtonic
### base url http://localhost:3000/

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
