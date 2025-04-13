# BidBazaar API Reference Guide

This document serves as a comprehensive guide to the BidBazaar API for the frontend development team. It includes detailed information about all available endpoints, authentication requirements, expected request formats, and response structures.

## Table of Contents
- [Authentication](#authentication)
  - [Token Format](#token-format)
  - [Token Management](#token-management)
- [User Management](#user-management)
  - [Register User](#register-user)
  - [Login User](#login-user)
  - [Logout User](#logout-user)
  - [Refresh Token](#refresh-token)
- [Product Management](#product-management)
  - [List All Products](#list-all-products)
  - [Get Product Details](#get-product-details)
  - [Create Product](#create-product)
  - [Upload Product Images](#upload-product-images)
- [Bidding System](#bidding-system)
  - [Place Bid](#place-bid)
  - [Get All Bids for a Product](#get-all-bids-for-a-product)
  - [Get Highest Bid for a Product](#get-highest-bid-for-a-product)
  - [Sell Product to Bidder](#sell-product-to-bidder)
- [Product Filters](#product-filters)
  - [Products by Category](#products-by-category)
  - [Products by Price Range](#products-by-price-range)
  - [New Products](#new-products)
  - [Used Products](#used-products)
  - [My Bids on Product](#my-bids-on-product)
  - [Products Sold by Seller](#products-sold-by-seller)
  - [Active Auctions by End Time](#active-auctions-by-end-time)
  - [My Listings](#my-listings)

## Authentication

### Token Format

BidBazaar uses JSON Web Tokens (JWT) for authentication. Each authenticated request should include the token in the authorization header:


Authorization: Bearer <your_access_token>


### Token Management

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Store both tokens securely on the client side
- When the access token expires, use the refresh token to get a new access token

## User Management

### Register User

Register a new user account.

- *URL*: /api/user/register/
- *Method*: POST
- *Authentication*: None
- *Request Body*:
  json
  {
    "username": "exampleuser",
    "email": "user@example.com",
    "password": "securepassword"
  }
  
- *Success Response*:
  - *Code*: 201 Created
  - *Content*: 
    json
    {
      "message": "User created successfully",
      "access_token": "<jwt_access_token>",
      "refresh_token": "<jwt_refresh_token>",
      "user": {
        "id": 1,
        "username": "exampleuser",
        "email": "user@example.com",
        "first_name": "",
        "last_name": "",
        "is_staff": false
      }
    }
    
- *Error Response*:
  - *Code*: 400 Bad Request
  - *Content*: {"error": "Username already taken"} or {"error": "All fields are required"}

### Login User

Authenticate user and retrieve tokens.

- *URL*: /api/user/login/
- *Method*: POST
- *Authentication*: None
- *Request Body*:
  json
  {
    "username": "exampleuser",
    "password": "securepassword"
  }
  
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: 
    json
    {
      "message": "Login successful",
      "access_token": "<jwt_access_token>",
      "refresh_token": "<jwt_refresh_token>",
      "user": {
        "id": 1,
        "username": "exampleuser",
        "email": "user@example.com",
        "first_name": "",
        "last_name": "",
        "is_staff": false
      }
    }
    
- *Error Response*:
  - *Code*: 400 Bad Request
  - *Content*: {"error": "Invalid credentials"}

### Logout User

Log out and invalidate user tokens.

- *URL*: /api/user/logout/
- *Method*: POST
- *Authentication*: Required
- *Request Body*: None
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: {"message": "Logout successful"}
- *Error Response*:
  - *Code*: 401 Unauthorized
  - *Content*: {"detail": "Authentication credentials were not provided."}

### Refresh Token

Get a new access token using the refresh token.

- *URL*: /api/user/refresh/
- *Method*: POST
- *Authentication*: None
- *Request Body*:
  json
  {
    "refresh": "<jwt_refresh_token>"
  }
  
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: 
    json
    {
      "access": "<new_jwt_access_token>"
    }
    
- *Error Response*:
  - *Code*: 401 Unauthorized
  - *Content*: {"detail": "Token is invalid or expired"}

## Product Management

### List All Products

Get a list of all products.

- *URL*: /api/auction/products/
- *Method*: GET
- *Authentication*: None
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: 
    json
    [
      {
        "id": 1,
        "user_id": 1,
        "title": "iPhone 12",
        "description": "Used iPhone 12 in good condition",
        "starting_price": 50000,
        "start_date": "2025-02-15T12:00:00",
        "end_date": "2025-02-20T12:00:00",
        "sold": false,
        "is_listed": true,
        "highest_bid_id": null,
        "created_at": "2025-02-10T16:12:07.717739",
        "category_new_used": "used",
        "images": [
          {
            "id": 1,
            "image": "product_images/iphone12.jpg"
          }
        ],
        "highest_bid_amount": 52000
      }
    ]
    

### Get Product Details

Get detailed information about a specific product.

- *URL*: /api/auction/products/{product_id}/
- *Method*: GET
- *Authentication*: None
- *URL Parameters*: product_id=[integer]
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: 
    json
    {
      "id": 1,
      "user_id": 1,
      "title": "iPhone 12",
      "description": "Used iPhone 12 in good condition",
      "starting_price": 50000,
      "start_date": "2025-02-15T12:00:00",
      "end_date": "2025-02-20T12:00:00",
      "sold": false,
      "is_listed": true,
      "highest_bid_id": null,
      "created_at": "2025-02-10T16:12:07.717739",
      "category_new_used": "used",
      "images": [
        {
          "id": 1,
          "image": "product_images/iphone12.jpg"
        }
      ],
      "highest_bid_amount": 52000
    }
    
- *Error Response*:
  - *Code*: 404 Not Found
  - *Content*: {"error": "Product not found"}

### Create Product

Create a new product listing.

- *URL*: /api/auction/products/
- *Method*: POST
- *Authentication*: Required
- *Request Body*:
  json
  {
    "title": "iPhone 12",
    "description": "Used iPhone 12 in good condition",
    "starting_price": 50000,
    "start_date": "2025-02-15T12:00:00",
    "end_date": "2025-02-20T12:00:00",
    "category_new_used": "used"
  }
  
- *Success Response*:
  - *Code*: 201 Created
  - *Content*: Product object
- *Error Response*:
  - *Code*: 400 Bad Request
  - *Content*: {"error": "Missing required fields", "fields": ["title", "starting_price"]}

### Upload Product Images

Upload images for a product.

- *URL*: /api/auction/products/{product_id}/upload-images/
- *Method*: POST
- *Authentication*: Required
- *Content-Type*: multipart/form-data
- *URL Parameters*: product_id=[integer]
- *Form Data*: images=[file1, file2, ...]
- *Success Response*:
  - *Code*: 201 Created
  - *Content*: Array of uploaded image objects
- *Error Response*:
  - *Code*: 400 Bad Request
  - *Content*: {"error": "No images provided"}
  - *Code*: 403 Forbidden
  - *Content*: {"error": "You do not have permission to upload images for this product"}

## Bidding System

### Place Bid

Place a bid on a product.

- *URL*: /api/auction/products/{product_id}/place-bid/
- *Method*: POST
- *Authentication*: Required
- *URL Parameters*: product_id=[integer]
- *Request Body*:
  json
  {
    "bid_amount": 55000,
    "start_date": "2025-02-15T12:00:00",
    "end_date": "2025-02-18T12:00:00"
  }
  
- *Important Note*: The start_date and end_date fields are specific to the bid, not the product. They represent the time period during which the buyer's bid remains valid on the market. After the end date, the bid is considered expired. This is different from the product's start and end dates which define when the product is listed for auction.
- *Date Format*: Dates must be provided in ISO format (YYYY-MM-DDTHH:MM:SS). The API performs validation to ensure end_date is after start_date.
- *Success Response*:
  - *Code*: 201 Created
  - *Content*: 
    json
    {
      "id": 1,
      "product_id": 1,
      "user_id": 2,
      "bid_amount": 55000,
      "bid_time": "2025-02-16T14:30:45.123456",
      "start_date": "2025-02-15T12:00:00",
      "end_date": "2025-02-18T12:00:00"
    }
    
- *Error Response*:
  - *Code*: 400 Bad Request
  - *Content*: 
    - {"error": "Bid amount is required"}
    - {"error": "Invalid bid amount"}
    - {"error": "Start date and end date are required"}
    - {"error": "End date must be after start date"}
    - {"error": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}
    - {"error": "You cannot bid on your own product"}
    - {"error": "This product is not available for bidding"}
    - {"error": "Bid must be at least the starting price: 50000"}
    - {"error": "Bid must be higher than the current highest bid: 52000"}

### Get All Bids for a Product

Get a list of all bids for a specific product.

- *URL*: /api/auction/products/{product_id}/bids/
- *Method*: GET
- *Authentication*: None
- *URL Parameters*: product_id=[integer]
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: 
    json
    [
      {
        "id": 1,
        "user_id": 2,
        "bid_amount": 55000,
        "bid_time": "2025-02-16T14:30:45.123456",
        "start_date": "2025-02-15T12:00:00",
        "end_date": "2025-02-18T12:00:00",
        "username": "bidder1"
      }
    ]
    
- *Error Response*:
  - *Code*: 404 Not Found
  - *Content*: {"error": "Product not found"}

### Get Highest Bid for a Product

Get the highest bid for a specific product.

- *URL*: /api/auction/products/{product_id}/highest-bid/
- *Method*: GET
- *Authentication*: None
- *URL Parameters*: product_id=[integer]
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: 
    json
    {
      "id": 1,
      "user_id": 2,
      "bid_amount": 55000,
      "bid_time": "2025-02-16T14:30:45.123456",
      "start_date": "2025-02-15T12:00:00",
      "end_date": "2025-02-18T12:00:00",
      "username": "bidder1"
    }
    
- *Error Response*:
  - *Code*: 404 Not Found
  - *Content*: 
    - {"error": "Product not found"}
    - {"message": "No bids found for this product"}

### Sell Product to Bidder

Sell a product to a specific bidder.

- *URL*: /api/auction/products/{product_id}/sell/{bid_id}/
- *Method*: POST
- *Authentication*: Required
- *URL Parameters*:
  - product_id=[integer]
  - bid_id=[integer]
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: Updated product object with sold status
- *Error Response*:
  - *Code*: 403 Forbidden
  - *Content*: {"error": "You do not have permission to sell this product"}
  - *Code*: 400 Bad Request
  - *Content*: 
    - {"error": "This product has already been sold"}
    - {"error": "This bid is not for the specified product"}

## Product Filters

### Products by Category

Get products filtered by category.

- *URL*: /api/auction/products/category/
- *Method*: GET
- *Authentication*: None
- *URL Parameters*: category=[string] (e.g., "used" or "new")
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: Array of product objects matching the category

### Products by Price Range

Get products filtered by price range.

- *URL*: /api/auction/products/price-range/
- *Method*: GET
- *Authentication*: None
- *URL Parameters*:
  - min_price=[integer]
  - max_price=[integer]
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: Array of product objects within the price range

### New Products

Get all new products.

- *URL*: /api/auction/products/new/
- *Method*: GET
- *Authentication*: None
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: Array of new product objects

### Used Products

Get all used products.

- *URL*: /api/auction/products/used/
- *Method*: GET
- *Authentication*: None
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: Array of used product objects

### My Bids on Product

Get all bids made by the authenticated user on a specific product.

- *URL*: /api/auction/products/{product_id}/my-bids/
- *Method*: GET
- *Authentication*: Required
- *URL Parameters*: product_id=[integer]
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: 
    json
    [
      {
        "bid_id": 1,
        "bid_amount": 55000,
        "bid_time": "2025-02-16T14:30:45.123456",
        "start_date": "2025-02-15T12:00:00",
        "end_date": "2025-02-18T12:00:00"
      }
    ]
    

### Products Sold by Seller

Get all products sold by a specific seller.

- *URL*: /api/auction/products/seller/{seller_id}/sold/
- *Method*: GET
- *Authentication*: None
- *URL Parameters*: seller_id=[integer]
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: Array of sold product objects by the seller

### Active Auctions by End Time

Get active auctions sorted by end time.

- *URL*: /api/auction/products/active/by-end-time/
- *Method*: GET
- *Authentication*: None
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: Array of active product auctions sorted by end time

### My Listings

Get all listings created by the authenticated user.

- *URL*: /api/auction/my-listings/
- *Method*: GET
- *Authentication*: Required
- *Success Response*:
  - *Code*: 200 OK
  - *Content*: Array of product objects created by the user

## Error Handling

All API endpoints follow a consistent error format:

json
{
  "error": "Error message description",
  "details": "Additional details about the error (if available)"
}


Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (invalid input)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## API Integration Best Practices

1. *Token Management*:
   - Store tokens securely (localStorage is not recommended for production)
   - Implement automatic token refresh when access tokens expire
   - Clear tokens on logout

2. *Error Handling*:
   - Implement consistent error handling for all API requests
   - Display user-friendly error messages
   - Redirect to login page on 401 errors

3. *Loading States*:
   - Show loading indicators during API requests
   - Implement optimistic UI updates where appropriate

4. *Form Validation*:
   - Validate form inputs on the client side before submitting
   - Handle validation errors from the server

5. *Authentication Headers*:
   - Always include the Authorization header with Bearer token for authenticated endpoints
   - Handle token refresh flows automatically