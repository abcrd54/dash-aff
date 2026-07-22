import type { FC } from "hono/jsx";
import type { JWTPayload } from "../middleware/auth";

interface NavbarProps {
  user: JWTPayload;
  title: string;
}

const Navbar: FC<NavbarProps> = ({ user, title }) => {
  return (
    <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      <div class="flex items-center gap-3">
        <button
          id="sidebar-toggle-btn"
          class="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-base lg:text-lg font-semibold text-slate-800 truncate">{title}</h1>
      </div>

      <div class="flex items-center gap-2 lg:gap-4">
        <span
          class={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === "admin"
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {user.role}
        </span>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-sm font-medium text-slate-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span class="hidden sm:inline text-sm font-medium text-slate-700">{user.username}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
