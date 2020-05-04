const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("config");
const ticker = require("./moneyTicker")
const path = require("path");

require("dotenv").config();

//Port
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//Connect to MongoDB
mongoose.connect(config.get("mongoURI"), {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.on("error", () => {
    console.log("error");
});
connection.once("open", () => {
    console.log("MongoDB connection established successfully");
});

const userRouter = require("./routes/api/users");
const packsRouter = require("./routes/api/packs");
const shopRouter = require("./routes/api/shop");
const authRouter = require("./routes/api/auth");

app.use("/api/users", userRouter);
app.use("/api/packs", packsRouter)
app.use("/api/auth", authRouter)
app.use("/api/shop", shopRouter)

//Used to serve the production build of the app
app.use(express.static("client/build"));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
})


//Listen on port
app.listen(port, () => {
    console.log("Server is running on port: " + port);
});