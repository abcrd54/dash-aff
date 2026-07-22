import { getServiceBySlug } from "./db";

export function getServiceClient(slug: string) {
  const service = getServiceBySlug(slug);
  if (!service || !service.is_active) {
    throw new Error(`Service "${slug}" not found or inactive`);
  }

  return {
    fetch: async (path: string, init?: RequestInit) => {
      const res = await fetch(`${service.base_url}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": service.api_key,
          ...init?.headers,
        },
      });
      return res;
    },

    getJSON: async <T>(path: string): Promise<T> => {
      const res = await fetch(`${service.base_url}${path}`, {
        headers: {
          "x-api-key": service.api_key,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Proxy error ${res.status}: ${text}`);
      }
      return res.json() as Promise<T>;
    },

    postJSON: async <T>(path: string, body: unknown): Promise<T> => {
      const res = await fetch(`${service.base_url}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": service.api_key,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Proxy error ${res.status}: ${text}`);
      }
      return res.json() as Promise<T>;
    },

    deleteJSON: async <T>(path: string): Promise<T> => {
      const res = await fetch(`${service.base_url}${path}`, {
        method: "DELETE",
        headers: {
          "x-api-key": service.api_key,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Proxy error ${res.status}: ${text}`);
      }
      return res.json() as Promise<T>;
    },
  };
}
