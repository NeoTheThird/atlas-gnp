/**
 * promise-wrapper for XMLHttpRequest
 *
 * @param {string} endpoint - endpoint to get
 * @returns {Promise<object>} data
 */
function request(endpoint) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint);
    xhr.send();
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
  });
}
