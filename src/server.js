require("dotenv").config();
const express = require("express");
const GnpApi = require("./GnpApi");
const api = new GnpApi(
  "https://mitglieder.gesellschaft-fuer-neuropaediatrie.org/",
  process.env.GNP_API_KEY,
  process.env.GEO_API_KEY,
  3600
);

const app = express();

// serve static files from the `public` folder
app.use(express.static(__dirname + "/../public"));
app.use(express.static(__dirname + "/../src/scripts"));

const server = app.listen(7000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
  api.getStats().then(console.log);
});

app.get("/api/getAtlas", (req, res) => {
  api.getAtlas().then(members => res.json(members));
});

app.get("/api/getStats", (req, res) => {
  api.getStats().then(stats => res.json(stats));
});

app.get("/stats", (req, res) => res.redirect("stats.html"));

// needed for backwards-compatibility
app.get("/embed", (req, res) => {
  res.redirect("/?embed=true");
});

app.get("/favicon.ico", (req, res) => {
  res.redirect(
    "https://gesellschaft-fuer-neuropaediatrie.org/wp-content/uploads/2018/10/cropped-apple-touch-icon-152x152-32x32.png"
  );
});
