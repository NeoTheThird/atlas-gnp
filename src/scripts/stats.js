const memberChartContext = document
  .getElementById("memberChart")
  .getContext("2d");
const ageIndicator = document.getElementById("ageIndicator");
var memberChart;

request("/api/getStats").then(stats => {
  console.log(stats);
  ageIndicator.innerHTML = "Aktualisiert vor " + stats.age + " Sekunden";
  memberChart = new Chart(memberChartContext, {
    // The type of chart we want to create
    type: "pie",

    // The data for our dataset
    data: {
      datasets: [
        {
          data: [stats.hidden, stats.popup, stats.nopopup],
          backgroundColor: ["#888888", "#003770", "#3EA9E9"]
        }
      ],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: ["Versteckt / Daten unvollständig", "Popup", "Kein Popup"]
    },

    // Configuration options go here
    options: {}
  });
});
