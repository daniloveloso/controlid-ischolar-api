import { monitorCatracas } from "../jobs/monitor-catracas.job.js";

async function run() {
  try {
    await monitorCatracas();
    process.exit(0);
  } catch (err) {
    console.error("Erro no monitoramento:", err);
    process.exit(1);
  }
}

run();