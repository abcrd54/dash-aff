import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getUserPersonas, linkUserPersona, unlinkUserPersona, getServicesForUser, getServiceBySlug, getServiceById } from "../lib/db";
import { getServiceClient } from "../lib/proxy";
import PersonaListPage from "../views/personas/index";

const personasRoutes = new Hono();

personasRoutes.get("/personas", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const services = getServicesForUser(user.id);

  if (services.length === 0) {
    return c.html(<PersonaListPage user={user} serviceName="No Service" personas={[]} error="No services assigned. Contact admin." />);
  }

  const serviceName = services[0].name;
  let personas: any[] = [];
  let error = "";

  for (const svc of services) {
    if (svc.slug === "aff-personal") {
      try {
        const aff = getServiceClient(svc.slug);
        const allPersonas = await aff.getJSON<any[]>("/api/personas");
        const userPersonas = getUserPersonas(user.id);
        const ownedIds = new Set(userPersonas.map(p => p.persona_id));
        const owned = allPersonas.filter((p: any) => ownedIds.has(p.id));
        personas = personas.concat(owned);
      } catch (e: any) {
        error = e.message;
      }
    }
  }

  return c.html(<PersonaListPage user={user} serviceName={serviceName} personas={personas} error={error || undefined} />);
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
    const service = getServiceBySlug("aff-personal")!;
    linkUserPersona(user.id, created.id, service.id, name);
  } catch (e: any) {
    return c.html(<PersonaListPage user={user} serviceName="aff-personal" personas={[]} error={e.message} />);
  }

  return c.redirect("/personas");
});

personasRoutes.post("/personas/:id/delete", authMiddleware, async (c) => {
  const personaId = c.req.param("id");
  let deleted = false;
  try {
    const aff = getServiceClient("aff-personal");
    await aff.deleteJSON(`/api/personas/${personaId}`);
    deleted = true;
  } catch (e: any) {
    // If 404, persona already gone — ok to clean up locally
    if (!e.message?.includes("404")) return c.redirect("/personas");
  }

  if (deleted) {
    unlinkUserPersona(personaId);
  } else {
    unlinkUserPersona(personaId);
  }

  return c.redirect("/personas");
});

export default personasRoutes;
