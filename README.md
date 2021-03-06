# GraphQL by Example

<!-- TOC depthfrom:2 depthto:4 orderedlist:false -->

- [Intro](#intro)
- [Hello world](#hello-world)
  - [Create server](#create-server)
  - [Create client](#create-client)
- [Queries: job board](#queries-job-board)
  - [Step 01: return greeting](#step-01-return-greeting)
  - [Step 02: return jobs](#step-02-return-jobs)
  - [Step 03: object associations](#step-03-object-associations)
  - [Step 04: client fetch data from server](#step-04-client-fetch-data-from-server)
  - [Step 05: filter entities](#step-05-filter-entities)
  - [Step 06: update client to show job details](#step-06-update-client-to-show-job-details)
  - [Step 07: refactor request.js](#step-07-refactor-requestjs)
  - [Step 08: handler errors](#step-08-handler-errors)
  - [Step 09: retrive a company](#step-09-retrive-a-company)
  - [Step 10: show jobs in company detail](#step-10-show-jobs-in-company-detail)
- [Mutations: job board](#mutations-job-board)
  - [Step 01: create a new record](#step-01-create-a-new-record)
  - [Step 02: return the new entity when creating](#step-02-return-the-new-entity-when-creating)
  - [Step 03: define mutations input type](#step-03-define-mutations-input-type)
  - [Step 04: call mutations from client](#step-04-call-mutations-from-client)
- [Authentication: job board](#authentication-job-board)
  - [Step 01: only autenthicated user can post a job](#step-01-only-autenthicated-user-can-post-a-job)
  - [Step 02: add token on create job request on client](#step-02-add-token-on-create-job-request-on-client)
  - [Step 03: Create jobs with the company of the logged user](#step-03-create-jobs-with-the-company-of-the-logged-user)
- [Apollo Client](#apollo-client)
  - [Step 01: install and config Apollo client](#step-01-install-and-config-apollo-client)
  - [Step 02: queries with Apollo Client](#step-02-queries-with-apollo-client)
  - [Step 03: authenticatin with ApolloLink](#step-03-authenticatin-with-apollolink)
  - [Step 04: caching and fetch policy](#step-04-caching-and-fetch-policy)
  - [Step 05: Update the cache after a mutation](#step-05-update-the-cache-after-a-mutation)
  - [Step 06: fragments](#step-06-fragments)
- [Subscriptions: chat application](#subscriptions-chat-application)
  - [Step 01: download and install dependences](#step-01-download-and-install-dependences)
  - [Step 02: defining a subscription](#step-02-defining-a-subscription)
  - [Step 03: enabling webshockets in Apollo Server](#step-03-enabling-webshockets-in-apollo-server)
  - [Step 04: subscription resolver with PubSub](#step-04-subscription-resolver-with-pubsub)
  - [Step 05: update the front with the new messages](#step-05-update-the-front-with-the-new-messages)
  - [Step 06: unsubscribe](#step-06-unsubscribe)
  - [Step 07: client authentication with websockets](#step-07-client-authentication-with-websockets)
  - [Step 08: server authentication with websockets](#step-08-server-authentication-with-websockets)
- [Apollo Client with React Hooks](#apollo-client-with-react-hooks)
  - [Step 01: setting up ApolloProvider](#step-01-setting-up-apolloprovider)
  - [Step 02: intro to React Hooks](#step-02-intro-to-react-hooks)
  - [Step 03: the useQuery Hook](#step-03-the-usequery-hook)
  - [Step 04: the useMutation Hook](#step-04-the-usemutation-hook)
  - [Step 05: the useSubscription Hook](#step-05-the-usesubscription-hook)
  - [Step 05: local state managment with apollo client](#step-05-local-state-managment-with-apollo-client)
  - [Step 06: writting custom hooks](#step-06-writting-custom-hooks)
- [Migrating to Apollo Client 3.0](#migrating-to-apollo-client-30)

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

## Queries: job board
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

### Step 03: object associations
* Create new entity (company) and the reference.
```graphql
type Company {
  id: ID!
  name: String
  description: String
}
type Job {
  id: ID!
  title: String
  description: String
  company: Company
}
```

* Create the resolver (Job) and export it
```js
const Job = {
    company: (job) => db.companies.get(job.companyId)
};

module.exports = { Query, Job };
```

* Check there is a company on the job object
![playground_02](https://user-images.githubusercontent.com/725743/104819502-2d7f7600-582e-11eb-957c-efd4428906ba.png)

### Step 04: client fetch data from server
* Create file to encapsulate the requests (__requests.js__)
```js
const ENDPOINT_URL = "http://localhost:9000/graphql"

export async function loadJobs() {
    const response = await fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
            query: ` {
                jobs {
                    id
                    title
                    company {
                        id
                        name
                    }
                }
              }`
        })
    });
    const responseBody = await response.json();
    return responseBody.data.jobs;
}
```

* Update JobBoard.js to do the fetch:
```js
import React, { Component } from 'react';
import { JobList } from './JobList';
import { loadJobs } from './requests'

export class JobBoard extends Component {

  constructor(props) {
    super(props)
    this.state = { jobs: []};
  }

  async componentDidMount() {
    const jobs = await loadJobs();
    this.setState({jobs});
  }

  render() {
    const {jobs} = this.state
    return (
      <div>
        <h1 className="title">Job Board</h1>
        <JobList jobs={jobs} />
      </div>
    );
  }
}
```

### Step 05: filter entities
* On __schema.graphql__ create the new query type: `job(id: ID!): Job`
```js
type Query {
  job(id: ID!): Job
  jobs: [Job]
}
```

* On __resolvers.js__ create the resolver function: `job: (root, args) => db.jobs.get(args.id)` 

* Pass the argument on the query
```graphql
query {
  job(id: "rJKAbDd_z"){
    id
    title
  }
}
```

### Step 06: update client to show job details

* Create the query with parameter in playground.
![playground_parameter](https://user-images.githubusercontent.com/725743/104836077-79243500-58ab-11eb-8912-320fa456c209.png)

* On client at __request.js__
```js
export async function loadJob(id) {
    const response = await fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
            query: ` query JobQuery ($id: ID!) {
                job(id: $id){
                  id
                  title
                  company {
                    id
                    name
                  }
                  description
                }
              }`,
              variables: {id}
        })
    });
    const responseBody = await response.json();
    return responseBody.data.job;
}
```

* On client at __JobDetails.js__ calling to the server query
```js
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { loadJob} from './requests'

export class JobDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {job: null};
  }

  async componentDidMount() {
    const {jobId} = this.props.match.params;
    const job = await loadJob(jobId);
    this.setState({job});
  }

  render() {
    const {job} = this.state;
    if (!job) {
      return null;
    }
    return (
      <div>
        <h1 className="title">{job.title}</h1>
        <h2 className="subtitle">
          <Link to={`/companies/${job.company.id}`}>{job.company.name}</Link>
        </h2>
        <div className="box">{job.description}</div>
      </div>
    );
  }
}
```

* View job details  
![job_details](https://user-images.githubusercontent.com/725743/104836541-d4a3f200-58ae-11eb-8f56-6ff767605234.png)


### Step 07: refactor request.js
* On __requests.js__ create a function that receives 2 parameters: query and query parameters.
```js
async function graphqlRequest(query, variables={}) {
    const response = await fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({query, variables})
    });
    const responseBody = await response.json();
    return responseBody.data;
}
```
* Update requests to call the new function
```js
export async function loadJobs() {
    const query = ` {
        jobs {
            id
            title
            company {
                id
                name
            }
        }
      }`;
    const {jobs} = await graphqlRequest(query)
    return jobs;
}

export async function loadJob(id) {
    const query = ` query JobQuery ($id: ID!) {
        job(id: $id){
          id
          title
          company {
            id
            name
          }
          description
        }
      }`;
    const {job} = await graphqlRequest(query, {id})
    return job;
}
```

### Step 08: handler errors

* Grapql server return json with the errors messages
![query_error](https://user-images.githubusercontent.com/725743/104837494-2cddf280-58b5-11eb-93c1-99a347ca9d05.png)

* Update __requests.js__ to show the error messaga on the browser
```js
async function graphqlRequest(query, variables={}) {
    const response = await fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({query, variables})
    });
    const responseBody = await response.json();
    if (responseBody.errors) {
        const message = responseBody.errors.map((error) => error.message).join('\n');
        throw new Error(message)
    }
    return responseBody.data;
}
```

### Step 09: retrive a company
* Server
  * On __schema.graphql__ add new field on Query type called _company_
  ```graphql
  type Query {
    company(id: ID!): Company
    job(id: ID!): Job
    jobs: [Job]
  }
  ```
  * Add the resolver called _company_
  ```js
  const Query = {
      company: (root, {id}) => db.companies.get(id),
      job: (root, {id}) => db.jobs.get(id),
      jobs: () => db.jobs.list()
  };
  ```
  * Test it on playground
  ![playground_company](https://user-images.githubusercontent.com/725743/104851329-aa752300-58f4-11eb-8563-72e23a1b0002.png)
* Client
  * On __requests.js__ create loadCompany function
  ```js
  export async function loadCompany(id) {
      const query = `query CompanyQuery ($id: ID!) {
          company(id: $id){
            id
            name
            description
          }
        }`;
      const {company} = await graphqlRequest(query, {id})
      return company;
  ```
  * On __ComanyDetails.js__ almost same code as __JobDetail.js__
  ```js
  import React, { Component } from 'react';
  import { loadCompany } from './requests'

  export class CompanyDetail extends Component {
    constructor(props) {
      super(props);
      this.state = {company: null};
    }

    async componentDidMount() {
      const {companyId} = this.props.match.params;
      const company = await loadCompany(companyId);
      this.setState({company});
    }

    render() {
      const {company} = this.state;
      if (!company)
        return null;
      return (
        <div>
          <h1 className="title">{company.name}</h1>
          <div className="box">{company.description}</div>
        </div>
      );
    }
  }  
  ```
    * Company detail view:
    ![company_detail](https://user-images.githubusercontent.com/725743/104852122-28d3c400-58f9-11eb-8d88-2d2e38885822.png)

### Step 10: show jobs in company detail
* Server
  * Update schema __schema.graphql__ adding jobs field
  ```graphql
  type Company {
    id: ID!
    name: String
    description: String
    jobs: [Job]
  }  
  ```
  * Update resolvers
  ```js
  const Company = {
      jobs: (company) => db.jobs.list().filter((job) => job.companyId === company.id)
  }  
  ```
  * Playground
    ![company_detail](https://user-images.githubusercontent.com/725743/104852490-941e9580-58fb-11eb-8b67-fba0bcb9b3f9.png)  

* Client
  * Update the query on _requests.js_ to select jobs
  ```js
  export async function loadCompany(id) {
      const query = `query CompanyQuery ($id: ID!) {
          company(id: $id){
            id
            name
            description
            jobs {
              id 
              title
            }
          }
        }`;
      const {company} = await graphqlRequest(query, {id})
      return company;
  }
  ```
  * Print jobs on _CompanyDetails.js_
  ```js
    render() {
      const {company} = this.state;
      if (!company)
        return null;
      return (
        <div>
          <h1 className="title">{company.name}</h1>
          <div className="box">{company.description}</div>
          <h1 className="title is-5">Jobs at {company.name}</h1>
          <JobList jobs={company.jobs} />
        </div>
      );
    }
  ```
  * Frontend view  
  ![show_jobs](https://user-images.githubusercontent.com/725743/104853068-cbdb0c80-58fe-11eb-8be3-9e4968858edc.png)    

## Mutations: job board
* Mutations: operation to modify the data.
* Mutation is a root type as Query

### Step 01: create a new record
* On __schema.graphql__ add the new mutation inside the mutation type:
```graphql
type Mutation {
  createJob(companyId:ID, title: String, description: String): ID
}
```

* On __resolvers.js__ definde de operation and export it:
```js
const Mutation = {
    createJob: (root, {companyId, title, description}) => {
        return db.jobs.create({companyId, title, description});
    }
}

module.exports = { Query, Mutation, Job, Company };
```

* Test the operation on the playground  

![mutation](https://user-images.githubusercontent.com/725743/104961657-0f08ae80-59d7-11eb-8dfc-ef53addc6712.png)


### Step 02: return the new entity when creating

* Update the mutation on __schema_graphql__
```graphql
type Mutation {
  createJob(companyId:ID, title: String, description: String): Job
}
```

* Update the mutation on the resolver to return a job intead and id
```js
const Mutation = {
    createJob: (root, {companyId, title, description}) => {
        const id = db.jobs.create({companyId, title, description});
        return db.jobs.get(id)
    }
}
```
* On playground create the job, it is possible to create an alias for the mutation

![mutation](https://user-images.githubusercontent.com/725743/105067255-cf49d180-5a7f-11eb-9739-960f8ace4343.png)

### Step 03: define mutations input type
* Reduce the number of arguments defining a new type
```graphql
type Mutation {
  createJob(input: CreateJobInput): Job
}

input CreateJobInput {
  companyId: ID
  title: String
  description: String
}
```
* Update the mutation input type
```js
const Mutation = {
    createJob: (root, {input}) => {
        const id = db.jobs.create(input);
        return db.jobs.get(id)
    }
}
```
* Playground  

![mutation_input_type](https://user-images.githubusercontent.com/725743/105069323-10db7c00-5a82-11eb-8ffe-b76264d00266.png)


### Step 04: call mutations from client
* New function to send a mutation is the same as sending a query, on __requests.js__
```js
export async function createJob(input) {
  const mutation = `mutation CreateJob($input: CreateJobInput) {
    job: createJob (input: $input) {
      id, title, description, company {id, name}
    }
  }`;
  const {job} = await graphqlRequest(mutation, {input});
  return job;
}
```

* Call the function from __JobForm.js__
```js
handleClick(event) {
  event.preventDefault();
  const companyId = "SJV0-wdOM"
  const {title, description} = this.state
  createJob({companyId, title, description}).then((job) => {
    this.props.history.push(`/jobs/${job.id}`)
  });
}
```

## Authentication: job board
### Step 01: only autenthicated user can post a job
* https://www.npmjs.com/package/express-jwt
* Avoid unauthenticated users post a job through the playground.
* Check user authenticated on the resolver.
  * On __server.js__ add the user to the context when creating the ApolloServer.
```js
const context = ({req}) => ({user: req.user});
const apolloServer = new ApolloServer({typeDefs, resolvers, context});  
```
  * On the resolver check it there is an user on the context, and return exception if not.
```js
const Mutation = {
    createJob: (root, {input}, context) => {
        if (!context.user) {
            throw new Error("Unautorized")
        }
        const id = db.jobs.create(input);
        return db.jobs.get(id)
    }
}
```  
* Testing
  * Get token from the browser:
  ![token](https://user-images.githubusercontent.com/725743/105215031-0cca5f80-5b51-11eb-90b3-af596bebab10.png)
  * Playground unathenticated user
  ![unauthenticated](https://user-images.githubusercontent.com/725743/105215085-1d7ad580-5b51-11eb-8f10-92287a9c21d4.png)
  * Playground athenticated user
  ![authenticated](https://user-images.githubusercontent.com/725743/105215163-36838680-5b51-11eb-8718-4d7e676a9b12.png)

### Step 02: add token on create job request on client
* On __request.js__ if user is logged add the session token to the request headers, we can user functions `isloggedIn` and `getAccessToken` from `auth.js`
```js
async function graphqlRequest(query, variables={}) {
    const request = {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({query, variables})
    };
    if (isLoggedIn()) {
      request.headers['authorization'] = 'Bearer ' + getAccessToken();
    }
    const response = await fetch(ENDPOINT_URL, request);
    const responseBody = await response.json();
    if (responseBody.errors) {
        const message = responseBody.errors.map((error) => error.message).join('\n');
        throw new Error(message)
    }
    return responseBody.data;
}
```
* View token on dev tools  

![session_token](https://user-images.githubusercontent.com/725743/105226612-81f16100-5b60-11eb-89c0-5d26a113cd08.png)

### Step 03: Create jobs with the company of the logged user
* On server
  * `server.js`add the database user to the context used for Apollo server
```js
const context = ({req}) => ({user: req.user && db.users.get(req.user.sub)});
```  
  * On `schema.graphql`: remove the companyId from the imput, because it will be added on the resolver.
```js
input CreateJobInput {
  title: String
  description: String
}
```  

  * On `resolvers.js`: add the `companyId` to the mutation from the user in the context
```js
const Mutation = {
    createJob: (root, {input}, context) => {
        if (!context.user) {
            throw new Error("Unautorized")
        }
        const id = db.jobs.create({...input, companyId: context.user.companyId});
        return db.jobs.get(id)
    }
}
```  
* On client
  * On `JobForm.js` there is no need to send the companyId any more.
```js
handleClick(event) {
  event.preventDefault();
  const {title, description} = this.state
  createJob({title, description}).then((job) => {
    this.props.history.push(`/jobs/${job.id}`)
  });
}
```  

## Apollo Client
### Step 01: install and config Apollo client
* https://www.apollographql.com/docs/react/
* Install packages
`$> npm install apollo-boost graphql`

* On `request.js` import packages and declare new apollo client instance
```js
import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost';

const client = new ApolloClient ({
  link: new HttpLink({uri: 'http://localhost:9000/graphql'}),
  cache: new InMemoryCache()
});
```

### Step 02: queries with Apollo Client
* Import `gql` library
```js
import gql from 'graphql-tag';
```

* Update the queries: create an object `gql`and call the method `query` from the client with an object with the query and the variables.
```js
//...
export async function loadJob(id) {
    const query = gql`
      query JobQuery ($id: ID!) {
        job(id: $id){
          id
          title
          company {
            id
            name
          }
          description
        }
      }`;    
    const {data: {job}} = await client.query({query, variables: {id}}); 
    return job;
}
```

* Update the mutations, same as queries but call the function __mutate__ instead query.
```js
export async function createJob(input) {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput) {
      job: createJob (input: $input) {
        id, 
        title, 
        description, 
        company {
          id, 
          name
        }
      }
  }`;
  const {data: {job}} = await client.mutate({mutation, variables: {input}});
  return job;
}
```
### Step 03: authenticatin with ApolloLink
* Import `ApolloLink`
`import { ApolloClient, HttpLink, InMemoryCache, ApolloLink} from 'apollo-boost';`

* Define the ApolloLink where adding the session token 
```js
const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    operation.setContext({
      headers: {
        'authorization': 'Bearer ' + getAccessToken()
      }
    })
  }
  return forward(operation);
});
```

* Add the new ApolloLink to be invoked before the operation (query or mutation)
```js
const client = new ApolloClient ({
  link: ApolloLink.from([
    authLink,
    new HttpLink({uri: ENDPOINT_URL})
  ]),
  cache: new InMemoryCache()
});
```

### Step 04: caching and fetch policy

* Now it is catching the queries

* Customize caching behaviour
https://www.apollographql.com/docs/react/data/queries/#supported-fetch-policies

* To always get fresh data from the server:
```js
const {data: {jobs}} = await client.query({query, fetchPolicy: 'no-cache'});
```

### Step 05: Update the cache after a mutation
* The objetive is to avoid a request after creating a job.

* Declare the query of a job in a constant
```js
const jobQuery = gql `query JobQuery ($id: ID!) {
  job(id: $id){
    id
    title
    company {
      id
      name
    }
    description
  }
}`;

export async function loadJob(id) {
    const {data: {job}} = await client.query({query: jobQuery, variables: {id}}); 
    return job;
}
```

* On __requests.js__ add a new parameter on method mutate from client:
```js
export async function createJob(input) {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput) {
      job: createJob (input: $input) {
        id
        title
        company {
          id
          name
        }
        description
      }
  }`;
  const {data: {job}} = await client.mutate({
    mutation, 
    variables: {input},
    update: (cache, {data}) => {
      cache.writeQuery({
        query: jobQuery,
        variables: {id: data.job.id},
        data
      })
    }
  });
  return job;
}
```
### Step 06: fragments
* The objetive es to avoid repeating code in graphql queries and mutations
* Define a fragment in playground

![fragment](https://user-images.githubusercontent.com/725743/105463920-0a6f1f00-5c91-11eb-82ba-b8183eb36d4c.png)

* Define the fragment in the code and use in the mutations and queries.
```graphql
const JOB_DETAIL_FRAGMENT = gql `
  fragment JobDetail on Job {
    id
    title
    company {
      id
      name
    }
    description    
  }`;

const JOB_QUERY = gql `
  query JobQuery ($id: ID!) {
    job(id: $id){
        ...JobDetail
    }
  }
  ${JOB_DETAIL_FRAGMENT}`;
```

## Subscriptions: chat application
* https://www.apollographql.com/docs/apollo-server/data/subscriptions/
* To recive real time updates

### Step 01: download and install dependences
* Download from here: https://github.com/uptoskill/graphql-chat
* Install dependences and start for both server and client
```shell
  $>npm install
  $>npm start
```
* Front  

<img src="https://user-images.githubusercontent.com/725743/105537227-e7288c00-5cf1-11eb-89e8-bc3ff95b7f98.png" alt="drawing" width="400"/>

### Step 02: defining a subscription
* Objetive: notify all chat user when there is a new message
* Add the subscription to the schema
```graphql
type Subscription {
  messageAdded: Message
}
```
* On the playground we can check that subcription uses `ws` protocolo instead `http`

![protocol](https://user-images.githubusercontent.com/725743/105609576-8610bf00-5daa-11eb-9bd7-62b9b3e1df7f.png)

### Step 03: enabling webshockets in Apollo Server
* WebSocket: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
* On the `server.js`
  * Import `http` module
  ```js
  const http = require ('http');
  ```
  * Prepare the server to receive subscriptions
  ```js
  const httpServer = http.createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);
  httpServer.listen(port, () => console.log(`Server started on port ${port}`));
  ```

### Step 04: subscription resolver with PubSub

* Install `graphql-subscriptions`
`npm install graphql-subscriptions`

* Import and create some variables 
```js
const {PubSub} = require('graphql-subscriptions');
const MESSAGE_ADDED = 'MESSAGE_ADDED';
const pubSub = new PubSub();
```

* Create and export the subscription
```js
const Subscription = {
  messageAdded: {
    subscribe: () => pubSub.asyncIterator(MESSAGE_ADDED)
  }
}
module.exports = {Query, Mutation, Subscription}
```

* __resolver.js__ publish message on the mutation
```js
const Mutation = {
  addMessage: (_root, {input}, {userId}) => {
    requireAuth(userId);
    const messageId = db.messages.create({from: userId, text: input.text});
    const message = db.messages.get(messageId);
    pubSub.publish(MESSAGE_ADDED, {messageAdded: message});
    return message;
  }
}
```
* Playground<br>
<img width="1126" alt="subscription_listening" src="https://user-images.githubusercontent.com/725743/105611050-6b8f1380-5db3-11eb-824b-19e396ca6ff1.png">

### Step 05: update the front with the new messages
* View pubSub implementations: https://www.apollographql.com/docs/apollo-server/data/subscriptions/#pubsub-implementations
* [`Redis`](https://github.com/davidyaha/graphql-redis-subscriptions)
* On client
  * Install dependences: 
    ```bash
    $>npm install apollo-link-ws subscriptions-transport-ws
    ```

  * Import packages on `client.js`
  ```js
   import {WebSocketLink} from 'apollo-link-ws';
   ```

  * Create the `WebSocketLink`
  ```js  
  const wsUrl = 'ws://localhost:9000/graphql';
  const wsLink = new WebSocketLink({ uri: wsUrl, options: { 
    lazy: true,
    reconnect: true
  }})
  ```

  * Changes on `client.js` to config Apollo client to use the wsLink
    * Import the split function
    ```js
    import {
        ApolloClient, ApolloLink, HttpLink, InMemoryCache, split
      } from 'apollo-boost';
    ```    

    * Use the split function to distinguis if is subscription or an http link.
    ```js
    function isSubscription(operation) {
      const definition = getMainDefinition(operation.query)
      return definition.kind === 'OperationDefinition' 
        && definition.operation === 'subscription';
    }

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: split(isSubscription, wsLink, httpLink),
      defaultOptions: {query: {fetchPolicy: 'no-cache'}}
    });
    ```

  * On `queries.js` create the subscription
  ```js
  const messageAddedSubscription = gql `subscription {
    messageAdded {
      id
      from
      text
    }
  }`;
  export function onMessageAdded(handleMessage) {
    const observable = client.subscribe({query: messageAddedSubscription});
    return observable.subscribe(({data}) => handleMessage(data.messageAdded));
  }    
  ```

  * On `Chat.js` create update the list of the messages
  ```js
  async componentDidMount() {
    const messages = await getMessages();
    this.setState({messages});
    this.subscription = onMessageAdded((message) => {
      this.setState({messages: this.state.messages.concat(message)});
    })
  }  
  ```

### Step 06: unsubscribe
* On `Chat.js` create an attribute on the component to store the subscription and call the method unsubscribe on the event `componentWillUnmount`
```js
class Chat extends Component {
  state = {messages: []};
  subscription = null;

  async componentDidMount() {
    const messages = await getMessages();
    this.setState({messages});
    this.subscription = onMessageAdded((message) => {
      this.setState({messages: this.state.messages.concat(message)});
    })
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  ...
}
```

### Step 07: client authentication with websockets
* On client.js send the access token when creating the webSocket link
```js
const wsLink = new WebSocketLink({ uri: wsUrl, options: { 
  connectionParams: () => ({ accessToken: getAccessToken() }),
  lazy: true,
  reconnect: true
} })
```
* Proof sending the token from client application.

![web_socket_on_devtools](https://user-images.githubusercontent.com/725743/105753039-5b5c6d00-5f48-11eb-930d-714fe07a8109.png)

* Proof sending the token from playground.

![playground_token](https://user-images.githubusercontent.com/725743/106393555-0b722000-63f8-11eb-9a33-82495b8f0c87.png)

### Step 08: server authentication with websockets
* Set the user in session in the context, the token is in the connections not in the request.
* In `server.js`
```js
function context({req, connection}) {
  if (req && req.user) {
    return {userId: req.user.sub};
  }
  if (connection && connection.context && connection.context.accessToken) {
    const token = connection.context.accessToken;
    const decodedToken = jwt.verify(token, jwtSecret);
    return {userId: decodedToken.sub};
  }
  return {};
}
```
* In the subcription resolver we receive the context where there is an attribute (userId) with the user in session, like queries and mutations, now we can validate the user before returning any data.
* In `resolvers.js`
```js
const Subscription = {
  messageAdded: {
    //the 3 parameter is the context where is the user in session.
    subscribe: (_root, _args, {userId}) => {
      requireAuth(userId);
      return pubSub.asyncIterator(MESSAGE_ADDED);
    }
  }
}
```
## Apollo Client with React Hooks
https://www.apollographql.com/docs/react/

### Step 01: setting up ApolloProvider
* On the client on `App.js`
  
  * Install new package
  `npm install @apollo/react-hooks`

  * Import the component `ApolloProvider` and the client instance from our graphql module.
  ```js
  import { ApolloProvider } from '@apollo/react-hooks'
  import client from './graphql/client'
  ```
  
  * In the render method grap all with `<ApolloProvider>` tag.
  ```js
  render() {
    const {user} = this.state;
    if (!user) {
      return <Login onLogin={this.handleLogin.bind(this)} />;
    }
    return (
      <ApolloProvider client={client}>
        <NavBar onLogout={this.handleLogout.bind(this)} />
        <Chat user={user} />
      </ApolloProvider>
    );  
  }  
  ```
### Step 02: intro to React Hooks
* React Hooks only works with functions and avoiding writting classes.
* On Hooks there is no state nor props.
* New `Chat.js`
```js
import React, { useState } from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

const Chat = ({user}) => {
  const [messages, setMessages] = useState([])
  
  const handleSend = (text) => {
    
    const message = {id: text, from: 'you', text};
    setMessages(messages.concat(message));
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Chatting as {user}</h1>
        <MessageList user={user} messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </section>
  );
};

export default Chat;
```

### Step 03: the useQuery Hook
* https://www.apollographql.com/docs/react/data/queries/
* On `queries.js` export the constant `messagesQuery`
```js
export const messagesQuery = gql`
  query MessagesQuery {
    messages {
      id
      from
      text
    }
  }
`;
```

* On `Chat.js` import `useQuery` and the `messageQuery` and call the useQuery
```js
import { useQuery } from '@apollo/react-hooks'
import { messagesQuery } from './graphql/queries'
const Chat = ({user}) => {

  const {data} = useQuery(messagesQuery);
  const messages = data ? data.messages : [];

};
```
* UseQuery can also return if is loading or if there is an error:  
```js
const { loading, error, data } = useQuery(GET_DOGS);
```

### Step 04: the useMutation Hook
* On `Chat.js` import useMutation and call it:
```js
import { useQuery, useMutation } from '@apollo/react-hooks'
import { messagesQuery, addMessageMutation } from './graphql/queries'

const Chat = ({user}) => {

  const [addMessage] = useMutation(addMessageMutation);

  const handleSend = async (text) => {    
    await addMessage({variables: {input: {text}}});
  };
}
```

### Step 05: the useSubscription Hook
* Unsubscribe is done automaticaly.

* Imports: 
```js
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import { messagesQuery, addMessageMutation, messageAddedSubscription } from './graphql/queries'
```

* Use the subscription hook:
```js
useSubscription(messageAddedSubscription, {
  onSubscriptionData: ({subscriptionData})=> {
    setMessages(messages.concat(subscriptionData.data.messageAdded));
  } 
});
```

* Using the state to update the messages list:
```js
//setMessages is a function that updates the list of messages.
const [messages, setMessages] = useState([]);
```

* Initial load of messages
```js
useQuery(messagesQuery, {
  onCompleted: ({messages}) => setMessages(messages)
});
```

### Step 05: local state managment with apollo client

* https://www.apollographql.com/docs/react/v2/data/local-state/
* This is a way to share data across components
* `cache.writeData`
* __Chat.js__
```js
const {data} = useQuery(messagesQuery);
const messages = data ? data.messages : [];

const [addMessage] = useMutation(addMessageMutation);

const handleSend = async (text) => {    
  await addMessage({variables: {input: {text}}});
};

useSubscription(messageAddedSubscription, {
  onSubscriptionData: ({client, subscriptionData})=> {
    client.cache.writeData({data: {
      messages: messages.concat(subscriptionData.data.messageAdded)
    }});
  } 
});
```

### Step 06: writting custom hooks
* Hook is a function whose name starts with _use_
* Create file `hooks.js`
```js
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import { messagesQuery, addMessageMutation, messageAddedSubscription } from './graphql/queries'

export function useChatMessages() {
  const {data} = useQuery(messagesQuery);
  const messages = data ? data.messages : [];
  const [addMessage] = useMutation(addMessageMutation);
  useSubscription(messageAddedSubscription, {
    onSubscriptionData: ({client, subscriptionData})=> {
      client.cache.writeData({data: {
        messages: messages.concat(subscriptionData.data.messageAdded)
      }});
    } 
  });
  return {
    messages,
    addMessage: (text) => addMessage({variables: {input: {text}}})
  };
}
```
* Use the hook function from the `chat.js`
```js
const Chat = ({user}) => {
  const {messages, addMessage} = useChatMessages();
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Chatting as {user}</h1>
        <MessageList user={user} messages={messages} />
        <MessageInput onSend={addMessage} />
      </div>
    </section>
  );
};
export default Chat;
```

## Migrating to Apollo Client 3.0
On 14 July 2020 the Apollo team announced the release of [Apollo Client 3.0](https://www.apollographql.com/blog/announcing-the-release-of-apollo-client-3-0/).


Thankfully, there are very few breaking changes compared to the previous version used in the course. All the concepts you learnt are still valid.

In fact, there is basically just one major difference. As of Apollo Client 3.0, all the functionality is in a single npm package called @apollo/client.

Need only the core client functionality, without any framework-specific integration? Install @apollo/client. Need WebSockets and subscriptions? That's already in @apollo/client, no need to install additional packages. React hooks? Yep, they're in @apollo/client as well.

All the classes and functions we used in the course are still the same, they just need to be imported from the new package. Examples below.

* __Core Apollo Client__

In the Job Board application we installed apollo-boost and wrote this code:

```js
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from 'apollo-boost';
```

To use Apollo Client 3.0 instead simply install @apollo/client instead of apollo-boost and change the import to be:

```js
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client/core';
```

* __WebSockets__

In the Chat application we added support for WebSockets and subscription by installing an additional apollo-link-ws package and using the WebSocketLink class:
```js
import { WebSocketLink } from 'apollo-link-ws';
````

That class is now available in @apollo/client and can be imported as follows:

import { WebSocketLink } from '@apollo/client/link/ws';
React Hooks

Instead of installing @apollo/react-hooks and importing:
```js
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks';
```

all the hooks are now in @apollo/client:
```js
import { useQuery, useMutation, useSubscription } from '@apollo/client';
```
* Full Details

You can find the full details on what's changed in the new release in the Apollo documentation: [Migrating to Apollo Client 3.0](https://www.apollographql.com/docs/react/migrating/apollo-client-3-migration/).

On Github I created a branch for each example with the code updated to Apollo Client 3.0:
[Job Board](https://github.com/uptoskill/graphql-job-board/commit/9c73758e300f3e7e5aa3c1d6572c42d7110ecaf7)
[Chat](https://github.com/uptoskill/graphql-chat/commit/93f32acabeb798e69868ddcd013f1ba6607063d7)

