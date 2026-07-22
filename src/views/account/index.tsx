import type { FC } from "hono/jsx";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";

interface AccountPageProps {
  user: JWTPayload;
  success?: string;
  error?: string;
}

const AccountPage: FC<AccountPageProps> = ({ user, success, error }) => {
  return (
    <Layout user={user} title="Akun Saya" currentPath="/account">
      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Akun</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Username</span>
              <span className="text-slate-800 font-medium text-sm">{user.username}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 text-sm">Role</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Ganti Password</h3>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm mb-4">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form method="POST" action="/account/password" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password Lama</label>
              <input
                type="password"
                name="current_password"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
              <input
                type="password"
                name="new_password"
                required
                minlength="6"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
