# GraphQL by Example

<!-- TOC depthfrom:2 depthto:4 orderedlist:false -->

- [Intro](#intro)
- [Hello world](#hello-world)
    - [Create server](#create-server)
    - [Create client](#create-client)
- [Job board](#job-board)
    - [Step 01: return greeting](#step-01-return-greeting)
    - [Step 02: return jobs](#step-02-return-jobs)
    - [Step 03: object assoctiations](#step-03-object-assoctiations)

<!-- /TOC -->

## Intro
Udemy course "GraphQL by Example"

Learn GraphQL by writing full-stack JavaScript applications with Node. Express, Apollo Server, React, Apollo Client.

https://www.udemy.com/course/graphql-by-example/

## Hello world
### Create server
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
![playground](https://user-images.githubusercontent.com/725743/104221625-6c35ba80-5441-11eb-9629-888044e6849b.png)

### Create client
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

## Job board
### Step 01: return greeting
* Copy backbone project from: https://github.com/uptoskill/graphql-job-board
* Build and start client and server
```shell
npm install 
npm start
```

https://www.apollographql.com/docs/apollo-server/integrations/middleware/

* Install _apollo-server-express_ and _graphql_ package: 
  `npm install apollo-server-express graphql`

* On __server.js__ add required packages:
```js
const fs = require('fs')
const {ApolloServer, gql} = require('apollo-server-express');
```

* Create schema in a separate file: __schema.graphql__
```graphql
type Query {
    greeting: String
}
```

* Create resolvers in a separate file: __resolvers.js__
```js
const Query = {
  gretting: () => 'Hello world 😜'
}
module.exports = { Query };
```

* Load schema and resolvers on the server.js (fs module is required)
```js
  const typeDefs = gql(fs.readFileSync('./schema.graphql', {encoding: 'utf8'}));
  const resolvers = require('./resolvers')
  const apolloServer = new ApolloServer({typeDefs, resolvers});
  apolloServer.applyMiddleware({app, path: '/graphql'});
```

### Step 02: return jobs
* Update the schema to add the job type
```graphql
type Query {
  jobs: [Job]
}

type Job {
  id: ID!
  title: String
  description: String
}
```
* Update the revolver to return the jobs list
```js
const db = require('./db');
const Query = {
    jobs: () => db.jobs.list()
};
module.exports = { Query };
```
* Playground  
![playground_02](https://user-images.githubusercontent.com/725743/104811155-e7102400-57f9-11eb-8c48-d56b8b3b63a5.png)

### Step 03: object assoctiations
* Create new entity (company) and the reference.
```graphql
type Job {
  id: ID!
  title: String
  description: String
  company: Company
}

type Company {
  id: ID!
  name: String
  description: String
}
```

* Create the resolver and export it
```js
const Job = {
    company: (job) => db.companies.get(job.companyId)
};

module.exports = { Query, Job };
```

* Check there is a company on the job object
![playground_02](https://user-images.githubusercontent.com/725743/104819502-2d7f7600-582e-11eb-957c-efd4428906ba.png)
