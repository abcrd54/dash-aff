import type { FC } from "hono/jsx";
import type { JWTPayload } from "../middleware/auth";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

interface LayoutProps {
  user: JWTPayload;
  title: string;
  currentPath: string;
  children?: any;
}

const Layout: FC<LayoutProps> = ({ user, title, currentPath, children }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} — Digital Affiliate Manager</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/main.css" />
        <script src="https://unpkg.com/htmx.org@1.9.12" />
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js" />
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var btn = document.getElementById('sidebar-toggle-btn');
            if (btn) {
              btn.addEventListener('click', function() {
                window.dispatchEvent(new CustomEvent('toggle-sidebar'));
              });
            }
          });
        `}} />
      </head>
      <body className="bg-slate-100 min-h-screen">
        <Sidebar user={user} currentPath={currentPath} />
        <div className="lg:ml-[260px] min-h-screen">
          <Navbar user={user} title={title} />
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
};

export default Layout;
