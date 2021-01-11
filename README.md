# GraphQL by Example
Udemy course "GraphQL by Example"

Learn GraphQL by writing full-stack JavaScript applications with Node.js, Express, Apollo Server, React, Apollo Client.

https://www.udemy.com/course/graphql-by-example/

## Hello world
* __Create server__
  1. Create project
  2. Add `package.json` file to root.
  3. Add dependences  
  `$> npm install apollo-server graphql`
  4. Add server code code
      ```js
      const {ApolloServer, gql} = require ('apollo-server')

      const typeDefs =  gql`
        schema {
          query: Query
        }
        type Query {
          gretting: String
        }`;

      const resolvers =  {
        Query: {
          gretting: () => 'Hello GraphQL World :)'
        }
      }

      const server = new ApolloServer({typeDefs, resolvers});

      server.listen({port: 9000})
        .then(({url}) => console.log(`Server running at ${url}`));  
      ```
  5. Test request with playground.


* __Create client__
  1. Create `index.html`
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Graphql Client</title>
    </head>
    <body>
      <h1>Loading</h1>
      <script src="app.js"></script>
    </body>
    </html>
    ```
  2. Create `app.js`
    ```js
    const GRAPHQL_URL = 'http://localhost:9000/'
    async function fetchGreeting() {
      const response = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify ({
          query: `
            query{
              gretting
            }       
          `
        })
      });
      const {data} = await response.json();
      return data
    }

    fetchGreeting().then(({gretting}) => 
    {
      console.log(gretting)
      document.querySelector('H1').textContent = gretting;
    }
    );  
    ```
