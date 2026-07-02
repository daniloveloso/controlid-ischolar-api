import { syncControlIDUsers } from "../jobs/sync-controlid-users.jobs.js";


async function run() {
  console.log("⏰ Cron: Sync ControlID iniciado");
  await syncControlIDUsers();
  console.log("✅ Cron: Sync ControlID finalizado");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Erro Sync ControlID", err);
  process.exit(1);
});
