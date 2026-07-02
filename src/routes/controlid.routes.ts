import { Router } from "express";
import { deviceIsAlive } from "../controllers/controlid.controller.js";

const router = Router();

router.get("/device_is_alive.fcgi", deviceIsAlive);

export default router;

//