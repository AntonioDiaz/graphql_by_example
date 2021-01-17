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