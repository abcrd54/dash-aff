import type { FC } from "hono/jsx";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";
import type { Content } from "../../lib/db";

interface ContentPageProps {
  user: JWTPayload;
  items: Content[];
}

const ContentPage: FC<ContentPageProps> = ({ user, items }) => {
  return (
    <Layout user={user} title="Manajemen Konten" currentPath="/content">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 lg:px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">Daftar Konten</h2>
          <button
            onclick="openCreateContentModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            + Tambah Konten
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Key</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Judul</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Diupdate</th>
                <th class="text-right px-6 py-3 text-slate-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {items.map((c) => (
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-6 py-4 text-slate-500 text-xs font-mono">{c.key}</td>
                  <td class="px-6 py-4 font-medium text-slate-800">{c.title}</td>
                  <td class="px-6 py-4 text-slate-500 text-xs">{c.updated_at}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        onclick={`openEditContent(${c.id})`}
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        hx-delete={`/content/${c.id}`}
                        hx-confirm={`Hapus konten "${c.title}"?`}
                        hx-target="body"
                        hx-swap="outerHTML"
                        class="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colspan="4" class="px-6 py-12 text-center text-slate-400">
                    Belum ada konten.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div id="createContentModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-4 sm:p-6" onclick="event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Tambah Konten Baru</h3>
          <form
            hx-post="/content"
            hx-target="body"
            hx-swap="outerHTML"
            onsubmit="closeCreateContentModal()"
            class="space-y-4"
          >
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Key (unik)</label>
              <input
                type="text"
                name="key"
                required
                placeholder="contoh: about-us"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Judul</label>
              <input
                type="text"
                name="title"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Konten</label>
              <textarea
                name="body"
                rows={6}
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onclick="closeCreateContentModal()"
                class="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="editContentModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-4 sm:p-6" onclick="event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Edit Konten</h3>
          <form
            id="editContentForm"
            hx-put="/content/{id}"
            hx-target="body"
            hx-swap="outerHTML"
            onsubmit="submitEditContent()"
            class="space-y-4"
          >
            <input type="hidden" id="editContentId" />
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Key</label>
              <input
                type="text"
                id="editContentKey"
                name="key"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Judul</label>
              <input
                type="text"
                id="editContentTitle"
                name="title"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Konten</label>
              <textarea
                id="editContentBody"
                name="body"
                rows={6}
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onclick="closeEditContentModal()"
                class="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        window._contentData = ${JSON.stringify(items)};
        function openCreateContentModal() { document.getElementById('createContentModal').classList.remove('hidden'); }
        function closeCreateContentModal() { document.getElementById('createContentModal').classList.add('hidden'); }
        function closeEditContentModal() { document.getElementById('editContentModal').classList.add('hidden'); }
        function openEditContent(id) {
          var c = window._contentData.find(function(x) { return x.id === id; });
          if (!c) return;
          document.getElementById('editContentId').value = c.id;
          document.getElementById('editContentKey').value = c.key;
          document.getElementById('editContentTitle').value = c.title;
          document.getElementById('editContentBody').value = c.body;
          document.getElementById('editContentModal').classList.remove('hidden');
        }
        function submitEditContent() {
          var form = document.getElementById('editContentForm');
          form.action = form.action.replace('{id}', document.getElementById('editContentId').value);
          closeEditContentModal();
        }
      `}} />
    </Layout>
  );
};

export default ContentPage;
