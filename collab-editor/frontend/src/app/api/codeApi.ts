// const API_URL = 'http://localhost:3333/api';

// /**
//  * Save code to backend
//  * @param {string} username - The name of the user
//  * @param {string} code - The code to save
//  * @returns {Promise<Object>} - API response
//  */
// export async function saveCode(username : String, code: String) {
//     const response = await fetch(`${API_URL}/save-code`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ username, code }),
//     });
  
//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error || 'Failed to save code');
//     }
  
//     return response.json();
//   }

//   /**
//  * Fetch saved code for a user
//  * @param {string} username - The name of the user
//  * @returns {Promise<Object>} - API response containing code data
//  */
// export async function getCode(username : String) {
//     const response = await fetch(`${API_URL}/get-code/${username}`);
  
//     if (!response.ok) {
//       throw new Error(await response.text() || 'Failed to fetch code');
//     }
  
//     return response.json();
//   }