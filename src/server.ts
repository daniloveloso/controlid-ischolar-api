import express, { Request, Response } from "express";
import dotenv from "dotenv";
import controlIdRoutes from "./routes/controlid.routes.js";
import { deviceIsAlive, handleNewUserIdentified } from "./controllers/controlid.controller.js"
import { prisma } from "./lib/prisma.js";
import usersRoutes  from "./routes/users.routes.js"
import syncRoutes from "./routes/sync.routes.js";
import { startSchedulers } from "./schedulers/catracas.scheduler.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use((req, _, next) => {
//  console.log("REQ:", req.method, req.url);
 // next();
//});



app.post("/device_is_alive.fcgi", deviceIsAlive);
app.get("/device_is_alive.fcgi", deviceIsAlive);
//app.post("/session_is_valid.fcgi", handleEvent);
app.post("/new_user_identified.fcgi", handleNewUserIdentified)

app.post("/session_is_valid.fcgi", (request : Request, response : Response) => {
  //console.log("chegou!!!!!!!")
  return response.send("OK")
})

app.post("/new_biometric_template.fcgi", (res: Response, req: Request) => {
  console.log("bio ", req.body)
  return;
})

app.get("/session_is_valid.fcgi", (request : Request, response : Response) => {
  //console.log("chegou!!!!!!!")
  return response.send("OK")
})

//api/notification

app.use((req, _, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});

app.use("/controlid", controlIdRoutes);
app.use("/users", usersRoutes)

app.use(syncRoutes)

app.get("/health", (_, res) => res.send("OK"));

//app.get("/test-db", async (_, res) => {
//  const users = await prisma.user.findMany();
//  res.json(users)
//})



app.listen(process.env.PORT || 3000, () => {
  console.log("API ControlID + iScholar rodando");
  startSchedulers();
});
