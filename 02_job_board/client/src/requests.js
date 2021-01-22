import {getAccessToken, isLoggedIn} from './auth';
import gql from 'graphql-tag';
import { ApolloClient, HttpLink, InMemoryCache, ApolloLink} from 'apollo-boost';

const ENDPOINT_URL = "http://localhost:9000/graphql"

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

const client = new ApolloClient ({
  link: ApolloLink.from([
    authLink,
    new HttpLink({uri: ENDPOINT_URL})
  ]),
  cache: new InMemoryCache()
});

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

const LOAD_JOBS_QUERY = gql `
  query JobsQuery {
    jobs {
      ...JobDetail
    }
  }
  ${JOB_DETAIL_FRAGMENT}`;

const LOAD_COMPANY_QUERY = gql `
  query CompanyQuery ($id: ID!) {
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

const CREATE_JOB_MUTATION = gql `
  mutation CreateJob($input: CreateJobInput) {
    job: createJob (input: $input) {
      ...JobDetail
    }
  }
  ${JOB_DETAIL_FRAGMENT}`;

export async function loadJobs() {
    const {data: {jobs}} = await client.query({query: LOAD_JOBS_QUERY, fetchPolicy: 'no-cache'});      
    return jobs;
}

export async function loadJob(id) {
    const {data: {job}} = await client.query({query: JOB_QUERY, variables: {id}}); 
    return job;
}

export async function loadCompany(id) {
    const {data: {company}} = await client.query({query: LOAD_COMPANY_QUERY, variables: {id}});       
    return company;
}

export async function createJob(input) {
  const {data: {job}} = await client.mutate({
    mutation: CREATE_JOB_MUTATION, 
    variables: {input},
    update: (cache, {data}) => {
      cache.writeQuery({
        query: JOB_QUERY,
        variables: {id: data.job.id},
        data
      })
    }
  });
  return job;
}
