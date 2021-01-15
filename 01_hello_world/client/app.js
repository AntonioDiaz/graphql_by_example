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