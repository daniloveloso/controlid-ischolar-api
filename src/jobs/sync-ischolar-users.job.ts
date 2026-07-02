import { prisma } from "../lib/prisma.js";
import { alunoExisteNoIscholar } from "../services/ischolar.service.js";

export async function syncIscholarUsers() {
  console.log("🔄 Iniciando sync iScholar...");

  const alunos = await prisma.user.findMany({
    where: {
      tipo: "ALUNO",
      matricula: { not: null },
      ativo: true,
    },
  });

  let atualizados = 0;
  let erros = 0;

  for (const aluno of alunos) {
    try {
      const ativo = await alunoExisteNoIscholar(aluno.matricula!);

      await prisma.user.update({
        where: { id: aluno.id },
        data: {
          ischolarAtivo: ativo,
          ischolarSyncAt: new Date(),
        },
      });

      atualizados++;
    } catch (error) {
      erros++;
      console.error(
        `❌ Erro sync iScholar | aluno=${aluno.nome} | matricula=${aluno.matricula}`,
        error
      );
    }
  }

  console.log(
    `✅ Sync iScholar concluído | alunos=${alunos.length} | ok=${atualizados} | erro=${erros}`
  );
}
