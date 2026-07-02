import { prisma } from "../lib/prisma.js";
import { loadUsersFromControlID } from "../services/controlid.service.js";

export async function syncControlIDUsers() {
  const users = await loadUsersFromControlID();

  for (const user of users) {
    const tipo = user.registration && user.registration.trim() !== ""
      ? "ALUNO"
      : "FUNCIONARIO";

    await prisma.user.upsert({
      where: {
        controlidUserId: String(user.id),
      },
      update: {
        nome: user.name,
        tipo,
        id_aluno: user.registration || null,
        ativo: true,
      },
      create: {
        controlidUserId: String(user.id),
        nome: user.name,
        tipo,
        id_aluno: user.registration || null,
        ativo: true,
      },
    });
  }
}
