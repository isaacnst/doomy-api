# Dummy REST API for Web Application Development
This repository provides a lightweight mock REST API designed specifically for testing and development purposes. It serves as a placeholder for your actual backend services during the early stages of web application development. Whether you’re building a frontend, testing client-server interactions, or creating prototypes, this API intents to offers a realistic yet fictional data.

## Features:
- JSON responses
- Metadata for entities
- Easy Integration: Use the provided endpoints to simulate API calls without connecting to a live backend.

## TODO:
- Help me to make a wishlist with awesome features
  
## How to Use:
Clone this repository to your local environment.
Start your frontend development by making requests to your custom endpoints.
Customize the responses as needed for your specific use cases.
Replace this dummy API with your actual backend services once they are ready.
Feel free to explore and experiment with this mock API as you build and refine your web application. Happy coding! 🚀

## Basic usage
- Defines the api directory. The default value is "api".
- Defines metadata.json. The file must contain the definition of the columns.
- Complete db.json if applicable.
- Run `npm run start` and let's make your requests.

## CLI run
- npm run start -- --PORT=8001 --API_DIR=./src/

## Accepted filters as query parameters for endpoints:

`~:` (Tilde): Verifies if the column contains the specified word.
`|:` (Vertical Bar): The column starts with the specified value followed by a hyphen.
`^:` (Circumflex): The column starts exactly with the specified value.
`$:` (Dollar Sign): The column ends exactly with the specified value.
`*:` (Asterisk): The column contains the specified value at any position.
If none of the above conditions are met, the column is validated to be equal to the specified value.

Example: http://localhost:4321/api/users/?last_name=^:jack will return all users whose last name begins with “jack.” It could be “jack,” “jacks,” or “jackson.” 