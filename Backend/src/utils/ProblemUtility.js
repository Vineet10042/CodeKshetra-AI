const axios = require('axios');


const getLanguageById = (lang) => {

  const language = {

    "c++": 54,
    "java": 62,
    "javascript": 63

  }

  return language[lang.toLowerCase()];

}


const submitBatch = async (submissions) => {

  //submissions me jo data hai usko judge0 ko bhejna hai             'https://judge0-ce.p.rapidapi.com/submissions/%7Btoken%7D'
  const encodedSubmissions = submissions.map(sub => {
    let encoded = { ...sub };
    if (encoded.source_code) encoded.source_code = Buffer.from(encoded.source_code).toString('base64');
    if (encoded.stdin) encoded.stdin = Buffer.from(encoded.stdin).toString('base64');
    if (encoded.expected_output) encoded.expected_output = Buffer.from(encoded.expected_output).toString('base64');
    return encoded;
  });

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'true'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      submissions: encodedSubmissions
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error("Judge0 Batch Error:", error.response?.data || error.message);
      // Pass the specific HTTP error back so userproblem.js can read it
      throw new Error(error.response?.data?.message || error.message || "Failed API request");
    }
  }

  return await fetchData();


}



const waiting = (timer) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, timer);
  });
};



//result token is array [db54881d-bcf5-4c7b-a2e3-d33fe7e25de7,  ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1,  1b35ec3b-5776-48ef-b646-d5522bdeb2cc] lekin ye ek string expect kar raha hai comma separated
//toh maine array ko str me convert kar diya 
const submitToken = async (resultToken) => {


  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'true',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    }

  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error("Judge0 Token Fetch Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || "Failed API request");
    }
  }


  while (true) {

    const result = await fetchData();


    const IsResultObtained = result.submissions.every((r) => r.status_id > 2);

    if (IsResultObtained) {
      // Decode base64 responses back to plain text
      result.submissions.forEach(sub => {
        if (sub.stdout) sub.stdout = Buffer.from(sub.stdout, 'base64').toString('utf-8');
        if (sub.stderr) sub.stderr = Buffer.from(sub.stderr, 'base64').toString('utf-8');
        if (sub.compile_output) sub.compile_output = Buffer.from(sub.compile_output, 'base64').toString('utf-8');
        if (sub.message) sub.message = Buffer.from(sub.message, 'base64').toString('utf-8');
        if (sub.expected_output) sub.expected_output = Buffer.from(sub.expected_output, 'base64').toString('utf-8');
      });
      return result.submissions;
    }


    await waiting(2000);

  }

}

// while (true) {
//     const result = await fetchData();

//     // Add this check! 
//     // Sometimes the API might return an error or empty response
//     if (result && result.submissions) {
//         const IsResultObtained = result.submissions.every((r) => r.status_id > 2);

//         if (IsResultObtained) {
//             return result.submissions;
//         }
//     } else {
//         // If we didn't get a valid result, break the loop to avoid infinite hanging
//         console.error("Invalid response from Judge0");
//         throw new Error("Failed to fetch submission results");
//     }

//     await waiting(2000);
// }
// }


module.exports = { getLanguageById, submitBatch, submitToken }