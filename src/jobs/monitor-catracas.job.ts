import { CATRACAS } from "../config/catracas.config.js";
import { getOnlineStatus, loginControlID, setOnline } from "../services/controlid-monitor.service.js";

export async function monitorCatracas() {
  console.log("🔎 Iniciando monitoramento das catracas...");

  for (const catraca of CATRACAS) {
    try {
      console.log(`➡️ Verificando ${catraca.nome} (${catraca.ip})`);

      const session = await loginControlID(catraca.ip);

      const online = await getOnlineStatus(catraca.ip, session);

      console.log(`Status atual: ${online}`);

      if (online !== "1") {
        console.log(`⚠️ ${catraca.nome} offline — corrigindo...`);

        await setOnline(catraca.ip, session);

        console.log(`✅ ${catraca.nome} voltou para online`);
      }
    } catch (error: any) {
      console.error(`❌ Erro na catraca ${catraca.nome}`, error.message);
    }
  }

  console.log("✔ Monitoramento finalizado");
}