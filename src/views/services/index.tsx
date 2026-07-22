import type { FC } from "hono/jsx";
import type { JWTPayload } from "../../middleware/auth";
import type { Service } from "../../lib/db";
import Layout from "../../components/layout";

interface ServicesPageProps {
  user: JWTPayload;
  services: Service[];
  error?: string;
  success?: string;
}

const ServicesPage: FC<ServicesPageProps> = ({ user, services, error, success }) => {
  return (
    <Layout user={user} title="Services" currentPath="/services">
      {error && (
        <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div class="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>
      )}

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Add Service</h2>
        <form method="POST" action="/services" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input name="name" required placeholder="aff-personal" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input name="slug" required placeholder="aff-personal" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Base URL</label>
            <input name="base_url" required placeholder="http://localhost:3000" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">API Key</label>
            <input name="api_key" required placeholder="da293fbe7b..." class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div class="col-span-2">
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
              Add Service
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="p-6 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">Services</h2>
        </div>
        {services.length === 0 ? (
          <div class="p-6 text-center text-slate-500 text-sm">No services configured.</div>
        ) : (
          <table class="w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-slate-600">Name</th>
                <th class="text-left px-6 py-3 font-medium text-slate-600">Slug</th>
                <th class="text-left px-6 py-3 font-medium text-slate-600">Base URL</th>
                <th class="text-left px-6 py-3 font-medium text-slate-600">Status</th>
                <th class="text-left px-6 py-3 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {services.map(s => (
                <tr>
                  <td class="px-6 py-3 text-slate-800">{s.name}</td>
                  <td class="px-6 py-3 text-slate-500 font-mono text-xs">{s.slug}</td>
                  <td class="px-6 py-3 text-slate-500 font-mono text-xs">{s.base_url}</td>
                  <td class="px-6 py-3">
                    <span class={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td class="px-6 py-3">
                    <form method="POST" action={`/services/${s.id}/toggle`} style="display:inline">
                      <button class="text-xs text-blue-600 hover:text-blue-800 mr-2 cursor-pointer">{s.is_active ? 'Disable' : 'Enable'}</button>
                    </form>
                    <form method="POST" action={`/services/${s.id}/delete`} style="display:inline" onsubmit="return confirm('Delete this service?')">
                      <button class="text-xs text-red-600 hover:text-red-800 cursor-pointer">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default ServicesPage;
