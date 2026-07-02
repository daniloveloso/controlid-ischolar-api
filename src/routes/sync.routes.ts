import { Router } from "express"
import { syncControlIDUsers } from "../jobs/sync-controlid-users.jobs.js"


const router = Router()

router.post("/sync/controlid-users", async (_, res) => {
  await syncControlIDUsers()
  res.json({ ok: true })
})

export default router
