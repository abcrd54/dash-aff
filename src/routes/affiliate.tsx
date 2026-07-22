import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAffiliateAccounts, deleteAffiliateAccount } from "../lib/db";
import { runOnboarding } from "../lib/orchestrator";
import AffiliatePage from "../views/affiliate/index";
import { raw } from "hono/html";

const affiliateRoutes = new Hono();

affiliateRoutes.get("/affiliate", authMiddleware, (c) => {
  const user = getSession(c)!;
  const accounts = getAffiliateAccounts(user.id);
  return c.html(<AffiliatePage user={user} accounts={accounts} />);
});

affiliateRoutes.get("/affiliate/create", authMiddleware, (c) => {
  const user = getSession(c)!;
  return c.html(
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Auto Create Bunsoc — Barokah Aff</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/main.css" />
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" />
        <script>{raw(`
          async function startOnboarding() {
            var form = document.getElementById('onboardingForm');
            var data = new FormData(form);
            var btn = document.getElementById('startBtn');
            btn.disabled = true;
            btn.textContent = 'Running...';
            document.getElementById('progress').classList.remove('hidden');
            document.getElementById('formSection').classList.add('opacity-50', 'pointer-events-none');

            var steps = {};
            var container = document.getElementById('steps');

            try {
              var res = await fetch('/affiliate/create/stream', { method: 'POST', body: data });
              var reader = res.body.getReader();
              var decoder = new TextDecoder();
              var buffer = '';

              while (true) {
                var { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                var lines = buffer.split('\\n');
                buffer = lines.pop() || '';

                for (var line of lines) {
                  if (line.startsWith('data: ')) {
                    var event = JSON.parse(line.slice(6));
                    var el = document.getElementById('step-' + event.step);
                    if (!el) {
                      el = document.createElement('div');
                      el.id = 'step-' + event.step;
                      el.className = 'flex items-center gap-2 text-sm py-1';
                      container.appendChild(el);
                    }
                    var icon = event.status === 'running' ? '<span class="text-blue-500 animate-pulse">⏳</span>' :
                               event.status === 'done' ? '<span class="text-emerald-500">✅</span>' :
                               '<span class="text-red-500">❌</span>';
                    var label = {
                      generate_email: 'Generate Email',
                      signup: 'Signup',
                      poll_inbox: 'Polling Inbox',
                      verify_link: 'Verify Email',
                      get_token: 'Get Token',
                      setup_profile: 'Setup Profile',
                      create_api_key: 'Create API Key',
                      complete: 'Complete',
                      error: 'Error'
                    }[event.step] || event.step;
                    el.innerHTML = icon + ' <span class="font-medium">' + label + '</span>';
                    if (event.detail) {
                      el.innerHTML += ' <span class="text-slate-500 text-xs">— ' + event.detail + '</span>';
                    }
                    if (event.step === 'complete') {
                      showToast('success', 'Sukses', 'Onboarding selesai!');
                      setTimeout(function() { window.location.href = '/affiliate'; }, 2000);
                    }
                    if (event.step === 'error') {
                      showToast('error', 'Gagal', event.detail);
                      btn.disabled = false;
                      btn.textContent = 'Mulai Onboarding';
                      document.getElementById('formSection').classList.remove('opacity-50', 'pointer-events-none');
                    }
                  }
                }
              }
            } catch (e) {
              showToast('error', 'Error', e.message);
              btn.disabled = false;
              btn.textContent = 'Mulai Onboarding';
              document.getElementById('formSection').classList.remove('opacity-50', 'pointer-events-none');
            }
          }
        `)}</script>
      </head>
      <body class="bg-slate-100 min-h-screen">
        <div class="max-w-2xl mx-auto p-4 lg:p-8">
          <a href="/affiliate" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">← Kembali</a>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 class="text-xl font-bold text-slate-900 mb-1">Auto Create Bunsoc</h2>
            <p class="text-slate-500 text-sm mb-6">Buat akun Bundle Social otomatis dengan email disposable</p>

            <div id="formSection">
              <form id="onboardingForm" onsubmit="event.preventDefault(); startOnboarding();" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                    <input type="text" name="name" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="My Account" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Email Domain</label>
                    <select name="email_domain" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="icloud">icloud</option>
                      <option value="outlook">outlook</option>
                      <option value="hotmail">hotmail</option>
                      <option value="gmail">gmail</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" name="password" required minlength="8" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min 8 karakter" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                    <select name="timezone" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Asia/Jakarta">Asia/Jakarta</option>
                      <option value="Asia/Makassar">Asia/Makassar</option>
                      <option value="Asia/Jayapura">Asia/Jayapura</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" name="first_name" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" name="last_name" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                    <input type="text" name="org_name" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama organisasi" />
                  </div>
                </div>
                <button
                  id="startBtn"
                  type="submit"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition cursor-pointer text-sm"
                >
                  Mulai Onboarding
                </button>
              </form>
            </div>

            <div id="progress" class="hidden mt-6 border-t border-slate-200 pt-4">
              <h3 class="text-sm font-semibold text-slate-700 mb-3">Progress</h3>
              <div id="steps" class="space-y-1" />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
});

affiliateRoutes.post("/affiliate/create/stream", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.parseBody();

  const data = {
    user_id: user.id,
    name: String(body.name || "").trim(),
    email_domain: String(body.email_domain || "icloud"),
    password: String(body.password || ""),
    first_name: String(body.first_name || "").trim(),
    last_name: String(body.last_name || "").trim(),
    org_name: String(body.org_name || "").trim(),
    timezone: String(body.timezone || "Asia/Jakarta"),
  };

  if (!data.name || !data.password || !data.first_name || !data.last_name || !data.org_name) {
    return c.json({ error: "Semua field wajib diisi" }, 400);
  }

  if (data.password.length < 8) {
    return c.json({ error: "Password minimal 8 karakter" }, 400);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of runOnboarding(data)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (e: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: "error", status: "failed", detail: e.message })}\n\n`)
        );
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

affiliateRoutes.delete("/affiliate/:id", authMiddleware, (c) => {
  const id = Number(c.req.param("id"));
  deleteAffiliateAccount(id);
  return c.redirect("/affiliate");
});

export default affiliateRoutes;