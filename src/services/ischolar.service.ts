import axios from "axios";
import { response } from "express";


const api = axios.create({
  baseURL: "https://api.ischolar.app",
  headers: {
    "X-Codigo-Escola": process.env.ISCHOLAR_ESCOLA!,
    "X-Autorizacao": process.env.ISCHOLAR_TOKEN!,
  },
});

/**
 * Registrar acesso do aluno
 */
export async function registrarAcesso(
  idMatricula: string,
  tipo: "E" | "S"
) {

  const dataHora = new Date().toLocaleString("sv-SE" ,{timeZone: "America/Sao_Paulo"})

  const response = await api.post("/catraca/acesso", null, {
    params: {
      id_matricula: idMatricula,
      data_hora: dataHora,
      tipo,
    },
  }
);

const dadosIscholar = response.data

console.log(dadosIscholar)

return response.data
}

export async function verificarMatricula(idMatricula: number) {
  const agora = new Date();

  const response = await axios.get(
    "https://api.ischolar.app/catraca",
    {
      params: {
        id_matricula: idMatricula,
        ano: agora.getFullYear(),
        mes: String(agora.getMonth() + 1).padStart(2, "0")
      },
      headers: {
        "X-Codigo-Escola": process.env.ISCHOLAR_ESCOLA!,
        "X-Autorizacao": process.env.ISCHOLAR_TOKEN!
      },
      validateStatus: () => true // importante p/ debug
    }
  );

  console.log("STATUS:", response.status);
  console.log("HEADERS:", response.headers);
  console.log("DATA:", response.data);

  return response.data;
}

export async function alunoExisteNoIscholar(
  matricula: string
): Promise<boolean> {
  try {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");

    const response = await api.get(
      `/aluno/busca?id_aluno=${matricula}`
    );

    //console.log(response.data)

    return response.data?.status === "sucesso";
  } catch (error) {
    return false;
  }
}