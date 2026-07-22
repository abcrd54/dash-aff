import type { FC } from "hono/jsx";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";

interface ManageAccountProps {
  user: JWTPayload;
  success?: string;
  error?: string;
}

const ManageAccountPage: FC<ManageAccountProps> = ({ user, success, error }) => {
  return (
    <Layout user={user} title="Management Akun" currentPath="/manage-account">
      <div class="max-w-xl">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Informasi Akun</h3>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500 text-sm">Username</span>
              <span class="text-slate-800 font-medium text-sm">{user.username}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500 text-sm">Role</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {user.role}
              </span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-slate-500 text-sm">ID</span>
              <span class="text-slate-800 font-mono text-sm">#{user.id}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Ubah Username</h3>

          {success && (
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm mb-4">
              {success}
            </div>
          )}
          {error && (
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form method="POST" action="/manage-account" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Password Konfirmasi</label>
              <input
                type="password"
                name="password"
                required
                placeholder="Masukkan password untuk konfirmasi"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Username Baru</label>
              <input
                type="text"
                name="username"
                required
                minlength="3"
                placeholder="Masukkan username baru"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Update Username
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ManageAccountPage;
