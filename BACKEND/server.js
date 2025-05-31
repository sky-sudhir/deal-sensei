import app from "./index.js";
import connectWithMongoDB from "./src/config/mongoConfig.js";
import "dotenv/config";

app.listen(process.env.PORT, () => {
  connectWithMongoDB();
  console.log(`app started with port ${process.env.PORT}`);
});
