import { app } from "./app.js";
import { env } from "./config/env.js";
import "./db/client.js";

app.listen(env.PORT, () => {
  console.log(`Backend running on port ${env.PORT}`);
});
