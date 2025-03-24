# customer registration

1. There are 2 types of default roles [admin , customer]

## Task

1. Roles Seeder
  - role_name : admin
  - role_slug : _admin
  - isDefault : true
  - createdBy : null

  - Role name : Customer
  


2. User Seeder
  - admin details
  - customer details

3. Product Category and Subcategory 

4. UserHasWishlist
  - _id Auto inc
  - user_id
  - WishlistItems [Array of id]
  - timestamp

5. WishlistItems
  - _id Auto inc
  - product_id
  - isDeleted
  - addedAt : Date.now

  6. Address Master
  - _id
  - billing address
    - billing pin_code
    - billing city
    - state
  

  - shipping address
    - city
    - pin 
    - state

7. Api
  - get_all_address_by_customer_id
  - 

8. Checkout
  - product prices
  - total prices
  - remove product from cart

First make blog categoris CRud operation
  - Id
  - Caregories name
  - Slug
  - Image
  - Timestamp


- add middleware in blog apis (admin middleware)
- create error message : Blog Category do not exist
- required : false for images in blog categories
- get apis don't have middleware


- add-blog (admin middleware)
- update-blog(admin middleware)
- delete-blog(admin middleware)

New task 22 mar
- add multiple category id using blog submission

- Blog_Tag (db schema)
  - id 
  - name
  - timestamp

- Blog Tag
  - add new field blog_tag_id in blogs schema


