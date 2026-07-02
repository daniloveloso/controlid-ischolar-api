import cron from "node-cron";
import { monitorCatracas } from "../jobs/monitor-catracas.job.js";
import { syncControlIDUsers } from "../jobs/sync-controlid-users.jobs.js";
import { syncIscholarUsers } from "../jobs/sync-ischolar-users.job.js";

export function startSchedulers() {

  console.log("Schedulers iniciados");

  // verifica catracas
  cron.schedule("*/5 * * * *", async () => {
    console.log("Verificando catracas...");

    try {
      await monitorCatracas();
    } catch (err) {
      console.error("Erro no monitoramento:", err);
    }

  })

// sync usuários catraca
cron.schedule("0 2 * * *", async () => {
  console.log("🔄 Sync usuários ControlID")
  try {
    await syncControlIDUsers()
  } catch (err) {
    console.error("Erro no sync de usuários ControlID:", err)
  }
}, { timezone: "America/Sao_Paulo" })

// sync status alunos iScholar
cron.schedule("0 3 * * *", async () => {
  console.log("🔄 Sync alunos iScholar")
  try {
    await syncIscholarUsers()
  } catch (err) {
    console.error("Erro no sync de alunos iScholar:", err)
  }
}, { timezone: "America/Sao_Paulo" })
}