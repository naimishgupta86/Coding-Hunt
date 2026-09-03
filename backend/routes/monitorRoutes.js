import express from "express";
import { getServerMonitor } from "../controllers/monitorController.js";

const router = express.Router();

// Live server monitoring
router.get("/status", getServerMonitor);

export default router;