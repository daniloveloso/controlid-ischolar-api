import { syncIscholarUsers } from "../jobs/sync-ischolar-users.job.js";


async function run() {
  console.log("⏰ Cron: Sync iScholar iniciado");
  await syncIscholarUsers();
  console.log("✅ Cron: Sync iScholar finalizado");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Erro Sync iScholar", err);
  process.exit(1);
});
