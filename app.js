const express = require("express");
const app = express();
const libRouter = require("./routes/libRouter");

const path = require("node:path");
const assetsPath = path.join(__dirname, "public");

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", libRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});

const PORT = 8000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`listening on port ${PORT}`);
});