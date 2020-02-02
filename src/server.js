require("dotenv").config();
const express = require("express");
const api = require("./GnpApi")(
  "https://mitglieder.gesellschaft-fuer-neuropaediatrie.org/",
  process.env.GNP_API_KEY,
  3600
);

const app = express();

app.set("view engine", "pug");

// serve static files from the `public` folder
app.use(express.static(__dirname + "/../public"));

const server = app.listen(7000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

app.get("/api/getAtlas", (req, res) => {
  api.getAtlas().then(members => res.json(members));
});

app.get("/", (req, res) => {
  res.render("index");
});

// needed for backwards-compatibility
app.get("/embed", (req, res) => {
  res.redirect("/?embed=true");
});

app.get("/favicon.ico", (req, res) => {
  res.redirect(
    "https://gesellschaft-fuer-neuropaediatrie.org/wp-content/uploads/2018/10/cropped-apple-touch-icon-152x152-32x32.png"
  );
});
