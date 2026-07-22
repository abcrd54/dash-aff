import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getUserPersonas, linkUserPersona, unlinkUserPersona, getServicesForUser } from "../lib/db";
import { getServiceClient } from "../lib/proxy";
import PersonaListPage from "../views/personas/index";

const personasRoutes = new Hono();

personasRoutes.get("/personas", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const services = getServicesForUser(user.id);
  const serviceName = services.length > 0 ? services[0].name : "No Service";

  let personas: any[] = [];
  try {
    const aff = getServiceClient("aff-personal");
    const allPersonas = await aff.getJSON<any[]>("/api/personas");
    const userPersonas = getUserPersonas(user.id);
    const ownedIds = new Set(userPersonas.map(p => p.persona_id));
    personas = allPersonas.filter((p: any) => ownedIds.has(p.id));
  } catch (e: any) {
    return c.html(<PersonaListPage user={user} serviceName={serviceName} personas={[]} error={e.message} />);
  }

  return c.html(<PersonaListPage user={user} serviceName={serviceName} personas={personas} />);
});

personasRoutes.post("/personas", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.parseBody();
  const name = String(body.name || "").trim();
  const type = String(body.type || "personal");
  const traits = String(body.traits || "ramah").split(",").map(s => s.trim()).filter(Boolean);
  const backstory = String(body.backstory || "").trim();
  const tone = String(body.tone || "hangat");
  const language = String(body.language || "indonesia");

  if (!name || !backstory) {
    return c.html(<PersonaListPage user={user} serviceName="aff-personal" personas={[]} error="Name and backstory are required." />);
  }

  try {
    const aff = getServiceClient("aff-personal");
    const config: any = { type, name, traits: traits.length > 0 ? traits : ["umum"], backstory, tone, language };
    const created = await aff.postJSON<any>("/api/personas", config);
    linkUserPersona(user.id, created.id, await getAffServiceId(), name);
  } catch (e: any) {
    return c.html(<PersonaListPage user={user} serviceName="aff-personal" personas={[]} error={e.message} />);
  }

  return c.redirect("/personas");
});

personasRoutes.post("/personas/:id/delete", authMiddleware, async (c) => {
  const personaId = c.req.param("id");
  try {
    const aff = getServiceClient("aff-personal");
    await aff.deleteJSON(`/api/personas/${personaId}`);
    unlinkUserPersona(personaId);
  } catch (e: any) {
    // Persona already deleted from backend — clean up locally
    unlinkUserPersona(personaId);
  }
  return c.redirect("/personas");
});

async function getAffServiceId(): Promise<number> {
  const { getServiceBySlug } = await import("../lib/db");
  return getServiceBySlug("aff-personal")!.id;
}

export default personasRoutes;
