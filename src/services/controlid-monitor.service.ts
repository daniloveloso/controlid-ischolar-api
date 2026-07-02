import axios from "axios";

const USER = process.env.CONTROLID_USER!;
const PASSWORD = process.env.CONTROLID_PASS!;

export async function loginControlID(ip: string) {
  const response = await axios.post(`http://${ip}/login.fcgi`, {
    login: USER,
    password: PASSWORD,
  });

  return response.data.session;
}

export async function getOnlineStatus(ip: string, session: string) {
  const response = await axios.post(
    `http://${ip}/get_configuration.fcgi?session=${session}`,
    {
        general: ["online"],
    }
  );

  return response.data.general.online;
}

export async function setOnline(ip: string, session: string) {
  const response = await axios.post(
    `http://${ip}/set_configuration.fcgi?session=${session}`,
    {
      general: {
        online: "1",
      }
    }
    
  );
  console.log(response.data)
}