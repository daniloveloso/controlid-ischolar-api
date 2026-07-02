import axios from "axios";

const CONTROLID_URL = process.env.CONTROLID_URL!
const CONTROLID_USER = process.env.CONTROLID_USER!
const CONTROLID_PASS = process.env.CONTROLID_PASS!

let session: string | null = null

export async function controlidLogin(): Promise<string> {
  const response = await axios.post(
    `${CONTROLID_URL}/login.fcgi`,
    {
      login: CONTROLID_USER,
      password: CONTROLID_PASS,
    },
    { timeout: 5000 }
  )

  session = response.data?.session
  if (!session) throw new Error('Não foi possível obter session da ControlID')

  return session
}

export async function loadUsersFromControlID() {
  if (!session) await controlidLogin()

  const response = await axios.post(
    `${CONTROLID_URL}/load_objects.fcgi?session=${session}`,
    { object: 'users' },
    { timeout: 10000 }
  )

  return response.data.users as Array<{
    id: number
    name: string
    registration: string
  }>
}

export async function liberarCatraca(
  deviceId: number,
  userId: number,
  userName: string,
  portalId: number
) {
  const url = process.env[`CONTROLID_${deviceId}_URL`];
  const session = process.env[`CONTROLID_${deviceId}_SESSION`];

  if (!url || !session) return;

  await axios.post(
    `${url}/remote_user_authorization.fcgi`,
    {
      event: 7,
      user_id: userId,
      user_name: userName,
      user_image: false,
      portal_id: portalId,
      actions: [
        { action: "catra", parameters: "allow=clockwise" }
      ]
    },
    {
      params: { session },
      headers: { "Content-Type": "application/json" }
    }
  );
}
