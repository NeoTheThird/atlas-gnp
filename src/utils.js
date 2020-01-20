/**
 * add a href to a link and format a label
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