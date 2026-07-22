import { Hono } from "hono";
import { authMiddleware, adminMiddleware, getSession } from "../middleware/auth";
import { getAllServices, createService, deleteService, updateService, getServiceById } from "../lib/db";
import ServicesPage from "../views/services/index";

const servicesRoutes = new Hono();

servicesRoutes.get("/services", authMiddleware, adminMiddleware, (c) => {
  const user = getSession(c)!;
  const services = getAllServices();
  return c.html(<ServicesPage user={user} services={services} />);
});

servicesRoutes.post("/services", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.parseBody();
  const name = String(body.name || "").trim();
  const slug = String(body.slug || "").trim();
  const base_url = String(body.base_url || "").trim();
  const api_key = String(body.api_key || "").trim();

  if (!name || !slug || !base_url || !api_key) {
    const user = getSession(c)!;
    return c.html(<ServicesPage user={user} services={getAllServices()} error="All fields are required." />);
  }

  try {
    createService(name, slug, base_url, api_key);
  } catch (e: any) {
    const user = getSession(c)!;
    return c.html(<ServicesPage user={user} services={getAllServices()} error={e.message} />);
  }

  return c.redirect("/services");
});

servicesRoutes.post("/services/:id/toggle", authMiddleware, adminMiddleware, (c) => {
  const id = Number(c.req.param("id"));
  const service = getServiceById(id);
  if (service) {
    updateService(id, { is_active: service.is_active ? 0 : 1 });
  }
  return c.redirect("/services");
});

servicesRoutes.post("/services/:id/delete", authMiddleware, adminMiddleware, (c) => {
  const id = Number(c.req.param("id"));
  deleteService(id);
  return c.redirect("/services");
});

export default servicesRoutes;
