/**
 * returns url parameters
 *
 * @returns {object} object containing all url parameters
 */
function getUrlParameters() {
  let ret = {};
  window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    (_, property, value) => {
      ret[property] = value === "false" ? false : value;
    }
  );
  return ret;
}
