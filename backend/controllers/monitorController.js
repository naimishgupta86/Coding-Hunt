import os from "os";

const serverStartedAt = Date.now();

// ===============================
// CPU LOAD
// ===============================

const getCpuLoad = () => {
  const cpus = os.cpus();

  if (!cpus || cpus.length === 0) {
    return 0;
  }

  let idle = 0;
  let total = 0;

  cpus.forEach((cpu) => {
    idle += cpu.times.idle;

    total +=
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.irq +
      cpu.times.idle;
  });

  if (total === 0) {
    return 0;
  }

  return Math.round((1 - idle / total) * 100);
};

// ===============================
// UPTIME
// ===============================

const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
};

// ===============================
// SERVER MONITOR
// ===============================

export const getServerMonitor = async (req, res) => {
  try {
    const serverName =
      req.app.get("serverName") ||
      process.env.SERVER_NAME ||
      "SERVER";

    const serverPort =
      req.app.get("serverPort") ||
      process.env.PORT ||
      5000;

    // CPU
    const load = Math.max(
      1,
      Math.min(100, getCpuLoad())
    );

    // Uptime
    const uptimeSeconds = Math.floor(
      (Date.now() - serverStartedAt) / 1000
    );

    // Memory
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const memoryUsage = Math.round(
      (usedMemory / totalMemory) * 100
    );

    // Health
    let health = "Healthy";

    if (load >= 90) {
      health = "Critical Load";
    } else if (load >= 70) {
      health = "High Load";
    } else if (memoryUsage >= 90) {
      health = "High Memory";
    }

    // Response
    res.status(200).json({
      success: true,

      server: {
        name: serverName,
        port: Number(serverPort),

        status: "ONLINE",

        health,

        load: `${load}%`,

        uptime: formatUptime(uptimeSeconds),

        hostname: os.hostname(),

        platform: os.platform(),

        architecture: os.arch(),

        nodeVersion: process.version,

        cpuCores: os.cpus().length,

        memory: {
          total: `${Math.round(
            totalMemory / 1024 / 1024
          )} MB`,

          free: `${Math.round(
            freeMemory / 1024 / 1024
          )} MB`,

          used: `${Math.round(
            usedMemory / 1024 / 1024
          )} MB`,

          usage: `${memoryUsage}%`,
        },
      },

      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Monitor Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch server status",
      error: error.message,
    });
  }
};