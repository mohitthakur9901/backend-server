import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: "./env",
});


connectDb().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running on port 3000");
    })
    app.on("error", (err) => {
        console.log(err);
    })
}).catch((err) => {
    console.log(err);
    process.exit(1);
});



