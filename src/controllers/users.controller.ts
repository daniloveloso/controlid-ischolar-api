import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";

export async function createUser(req: Request, res: Response) {
  const { nome, controlidUserId, matricula } = req.body;

  const tipo = matricula ? "ALUNO" : "FUNCIONARIO";

  const user = await prisma.user.create({
    data: {
      nome,
      controlidUserId,
      tipo,
      matricula: matricula || null,
      ativo: true,
    },
  });

  return res.json(user);
}
