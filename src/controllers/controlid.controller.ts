import { prisma } from "../lib/prisma.js";
import { registrarAcesso } from "../services/ischolar.service.js";
import { Request, Response } from "express";

export function deviceIsAlive(req: Request, res: Response) {
  return res.send("OK");
}

export function sessionIsValid(req: Request, res: Response) {
  return res.json({ valid: true });
}

export async function handleNewUserIdentified(req: Request, res: Response) {
  const { user_id, user_name, portal_id, confidence, device_id, uuid } = req.body;

  console.log("Identificação:", user_id);
  console.log("Identificação divice:", device_id);
  console.log("Identificação ID:", uuid);
  //console.log(req.body)

  let usuario = null;
  let resposta: any;
  let tipoAcesso: "E" | "S" = "E";

  try {
    usuario = await prisma.user.findUnique({
      where: {
        controlidUserId: String(user_id),
      },
    });

    // ❌ Usuário inexistente ou inativo
    if (!usuario || !usuario.ativo) {
      resposta = {
          result: {
          event: 6,
          user_id: Number(user_id),
          user_name,
          user_image: false,
          portal_id: Number(portal_id),
          actions: [
            {
              action: "catra",
              parameters: "",
            },
          ],}
        };
    } else {
      const isEntrada = Number(portal_id) === 1;
      tipoAcesso = isEntrada ? "E" : "S";

      const sentidoCatraca = isEntrada
        ? "allow=clockwise"
        : "allow=anticlockwise";

      // 🎓 Aluno → precisa estar ativo no iScholar
      if (usuario.tipo === "ALUNO" && !usuario.ischolarAtivo) {
        //resposta = { result:{ event: 6 } };
        resposta = {
          result: {
          event: 6,
          user_id: Number(user_id),
          user_name,
          user_image: false,
          portal_id: Number(portal_id),
          actions: [
            {
              action: "catra",
              parameters: "",
            },
          ],}
        };
      } else {
        console.log("liberado")
        // ✅ LIBERADO
        // if (confidence === '0'){
        //   sentidoCatraca = "allow=anticlockwise"
        // }
        resposta = {
          result: {
          event: 7,
          user_id: Number(user_id),
          user_name,
          user_image: false,
          portal_id: Number(portal_id),
          actions: [
            {
              action: "catra",
              parameters: confidence === '0' ?"allow=both" : sentidoCatraca,
            },
          ],}
        };
        console.log(resposta)
      }
    }
  } catch (err) {
    console.error("Erro regra ControlID:", err);
    resposta = {  result:{
          result: {
          event: 6,
          user_id: Number(user_id),
          user_name,
          user_image: false,
          portal_id: Number(portal_id),
          actions: [
            {
              action: "catra",
              parameters: "",
            },
          ],}
        } };
  }

  // 🔥 RESPONDE IMEDIATAMENTE À CATRACA (NUNCA BLOQUEIA)
  res.json(resposta);

  // ==================================================
  // ⬇️ DAQUI PRA BAIXO É PÓS-RESPOSTA (LOG / iScholar)
  // ==================================================

  try {
    if (!usuario) return;

    if (resposta.event === 6) {
      await prisma.accessLog.create({
        data: {
          userId: usuario.id,
          resultado: "NEGADO",
          deviceId: device_id,
          portalId: Number(portal_id),
          motivo:
            usuario.tipo === "ALUNO" && !usuario.ischolarAtivo
              ? "ALUNO_INATIVO_ISCHOLAR"
              : "USUARIO_INATIVO",
        },
      });
      return;
    }

    // LOG LIBERADO
    await prisma.accessLog.create({
      data: {
        userId: usuario.id,
        resultado: "LIBERADO",
        deviceId: device_id,
        portalId: parseInt(portal_id),
        motivo: tipoAcesso === "E" ? "ENTRADA" : "SAIDA",
      },
    });

    // 📌 iScholar SOMENTE para aluno ativo
    if (usuario.tipo === "ALUNO" && usuario.matricula) {
      try {
        const respostaIscholar = await registrarAcesso(usuario.matricula, tipoAcesso)

        await prisma.ischolarLog.create({
          data: {
            userId: usuario.id,
            status: respostaIscholar.status,
            mensagem: respostaIscholar.mensagem,
            idMatricula: respostaIscholar.id_matricula,
            tipo: respostaIscholar.tipo,
            dataHora: respostaIscholar.data_hora,
          }
        })

      } catch (err) {
        console.error("Erro ao registrar acesso no iScholar:", err);
      }
    }
  } catch (err) {
    console.error("Erro pós-resposta (log/iScholar):", err);
  }

  
}
