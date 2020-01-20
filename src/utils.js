/**
 * add a href to a link and format a label
 *
 * @param {string} label - Label describing the link
 * @param {string} href - Link url
 * @param {string} [protocol] - Protocol for the url
 * @returns {string} - formatted html
 */
function formatUrlLabel (label, href, protocol = "") {
  return href ?
    label + "<a href='" + (protocol || "") + href + "' target=_blank>" +
    href.replace("https://", "").replace("http://", "") + "</a><br>" :
    "";
}


module.exports = {
  formatUrlLabel: formatUrlLabel
}