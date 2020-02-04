const settings = Object.assign(
  {
    lat: 51, // latitute center
    long: 10.3, // longitude center
    zoom: 6, // initial zoom level
    radius: 45, // pixel radius for clustering
    embed: false // use embed mode (hide logo, show fullscreen-button)
  },
  getUrlParameters()
);
console.log(settings);

if (settings.embed) {
  try {
    document.getElementById("logo").classList.add("hidden");
    document.getElementById("fullscreen-button").classList.remove("hidden");
  } catch (error) {
    console.error("Error while entering embed mode: " + error);
  }
}

const element = document.getElementById("osm-map");
element.style = "height:100vh;";
const map = L.map(element);
L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors | <a href="https://gesellschaft-fuer-neuropaediatrie.org/" target="_blank">Gesellschaft für Neuropädiatrie</a>'
}).addTo(map);
map.setView(L.latLng(settings.lat, settings.long), settings.zoom);

/**
 * returns the apropriate leaflet icon
 *
 * @param {object} member - member object
 * @param {string} member.popup - popup html string
 * @param {string} member.color - pin color
 * @returns {object} leaflet icon
 */
function getIcon(member) {
  const type = member.popup ? "_full" : "_half";
  return new L.icon({
    iconUrl: "/img/pin_" + member.color + type + ".svg",
    shadowUrl: "/img/shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

const legend = L.control({ position: "bottomleft" });
legend.onAdd = function(map) {
  let div = L.DomUtil.create("div", "info legend");
  let labels = ["<strong>Legende</strong>"];
  let categories = [
    { color: "#003777", type: "ord. Mitglied" },
    { color: "#3EA9E9", type: "Juniormitglied" },
    { color: "#000000", type: "außerord. Mitglied" },
    { color: "#FFDC32", type: "Ehrenmitglied" },
    { color: "#888888", type: "Seniormitglied" }
  ];

  categories.forEach(c => {
    labels.push(
      '<span class="dot" style="background-color: ' +
        c.color +
        ';"></span> ' +
        c.type
    );
  });
  div.innerHTML = labels.join("<br>");
  return div;
};
legend.addTo(map);

request("/api/getAtlas").then(members => {
  let markers = L.markerClusterGroup({
    maxClusterRadius: settings.radius
  });
  members.forEach(member => {
    let marker = L.marker(member.latlong, {
      title: member.name,
      icon: getIcon(member)
    });
    if (member.popup) {
      marker.bindPopup(member.popup);
    }
    markers.addLayer(marker);
  });
  map.addLayer(markers);
});
