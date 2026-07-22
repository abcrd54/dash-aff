import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";
import type { AffiliateAccount } from "../../lib/db";

interface AffiliatePageProps {
  user: JWTPayload;
  accounts: AffiliateAccount[];
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  email_created: "Email Created",
  signed_up: "Signed Up",
  waiting_email: "Waiting Email",
  verified: "Verified",
  token_obtained: "Token OK",
  setup_done: "Setup Done",
  done: "Done",
  failed: "Failed",
};

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  email_created: "bg-blue-100 text-blue-700",
  signed_up: "bg-indigo-100 text-indigo-700",
  waiting_email: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  token_obtained: "bg-teal-100 text-teal-700",
  setup_done: "bg-cyan-100 text-cyan-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const AffiliatePage: FC<AffiliatePageProps> = ({ user, accounts }) => {
  return (
    <Layout user={user} title="Affiliate" currentPath="/affiliate">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 lg:px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">Auto Create Bunsoc</h2>
          <a
            href="/affiliate/create"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            + Create Account
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Name</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Email</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Org</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Status</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">API Key</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Created</th>
                <th class="text-right px-6 py-3 text-slate-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {accounts.map((a) => (
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-6 py-4 font-medium text-slate-800">{a.name}</td>
                  <td class="px-6 py-4 text-slate-500 text-xs">{a.email}</td>
                  <td class="px-6 py-4 text-slate-600 text-sm">{a.org_name}</td>
                  <td class="px-6 py-4">
                    <span class={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status] || "bg-slate-100 text-slate-600"}`}>
                      {statusLabels[a.status] || a.status}
                    </span>
                    {a.error && (
                      <span class="block text-xs text-red-500 mt-1">{a.error}</span>
                    )}
                  </td>
                  <td class="px-6 py-4">
                    {a.api_key ? (
                      <span
                        class="text-xs font-mono text-slate-500 cursor-pointer"
                        data-key={a.api_key}
                        onclick="copyApiKey(this.dataset.key)"
                        title="Click to copy"
                      >
                        {a.api_key.substring(0, 12)}...
                      </span>
                    ) : (
                      <span class="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td class="px-6 py-4 text-slate-500 text-xs">{a.created_at}</td>
                  <td class="px-6 py-4 text-right">
                    <button
                      data-id={a.id}
                      data-name={a.name}
                      onclick="deleteAccount(this.dataset.id, this.dataset.name)"
                      class="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                    Belum ada akun. Klik "Create Account" untuk memulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <script>{raw(`
        function copyApiKey(key) {
          navigator.clipboard.writeText(key).then(function() {
            showToast('success', 'Copied', 'API key copied to clipboard');
          });
        }
        function deleteAccount(id, name) {
          showConfirm('Hapus Akun', 'Yakin hapus akun "' + name + '"?', function() {
            fetch('/affiliate/' + id, { method: 'DELETE' }).then(function() {
              window.location.reload();
            });
          });
        }
      `)}</script>
    </Layout>
  );
};

export default AffiliatePage;