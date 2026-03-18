import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAdminBlogPosts, useBlogCategories, type BlogPost } from "@/hooks/useBlog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Error desconocido";
}

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category_id: string;
  author_name: string;
  status: string;
  meta_title: string;
  meta_description: string;
};

const emptyForm: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category_id: "",
  author_name: "Legado Inmobiliaria",
  status: "draft",
  meta_title: "",
  meta_description: "",
};

const AdminBlogContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useAdminBlogPosts();
  const { data: categories } = useBlogCategories();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditing(post.id);
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        cover_image: post.cover_image || "",
        category_id: post.category_id || "",
        author_name: post.author_name,
        status: post.status,
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
      });
    } else {
      setEditing("new");
      setForm(emptyForm);
    }
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: editing === "new" ? generateSlug(title) : prev.slug,
      meta_title: prev.meta_title || title.slice(0, 60),
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast({ title: "Error", description: "Título y contenido son obligatorios.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image: form.cover_image || null,
        category_id: form.category_id || null,
        author_name: form.author_name || "Legado Inmobiliaria",
        status: form.status,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        published_at: form.status === "published" ? new Date().toISOString() : null,
      };

      if (editing === "new") {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        toast({ title: "Artículo creado" });
      } else {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing);
        if (error) throw error;
        toast({ title: "Artículo actualizado" });
      }

      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    } catch (error: unknown) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Artículo eliminado" });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  // Editor view
  if (editing) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container max-w-4xl">
          <AdminBreadcrumb />
          <button
            onClick={() => setEditing(null)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la lista
          </button>

          <h1 className="font-serif text-3xl font-bold mb-8">
            {editing === "new" ? "Nuevo artículo" : "Editar artículo"}
          </h1>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Título *</label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título del artículo"
                className="bg-card border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Slug (URL)</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="url-del-articulo"
                className="bg-card border-border"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Categoría</label>
                <NativeSelect
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="bg-card border-border"
                  aria-label="Seleccionar categoría"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Estado</label>
                <NativeSelect
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="bg-card border-border"
                  aria-label="Seleccionar estado del artículo"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </NativeSelect>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Imagen de portada (URL)</label>
              <Input
                value={form.cover_image}
                onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                placeholder="https://..."
                className="bg-card border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Extracto</label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Resumen corto del artículo (aparece en listados)"
                rows={2}
                className="bg-card border-border resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Contenido * (HTML)
              </label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="<h2>Introducción</h2><p>Escribe aquí...</p>"
                rows={16}
                className="bg-card border-border resize-y font-mono text-sm"
              />
            </div>

            {/* SEO fields */}
            <div className="glass-dark rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">SEO</h3>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Meta Title ({form.meta_title.length}/60)</label>
                <Input
                  value={form.meta_title}
                  onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  maxLength={60}
                  placeholder="Título para Google"
                  className="bg-card border-border"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Meta Description ({form.meta_description.length}/160)</label>
                <Textarea
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  maxLength={160}
                  rows={2}
                  placeholder="Descripción para Google"
                  className="bg-card border-border resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Autor</label>
                <Input
                  value={form.author_name}
                  onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                  className="bg-card border-border"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-gold text-primary-foreground font-semibold px-8"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {editing === "new" ? "Crear artículo" : "Guardar cambios"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // List view
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container">
        <AdminBreadcrumb />
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al panel
            </button>
            <h1 className="font-serif text-3xl font-bold">Gestión del Blog</h1>
          </div>
          <Button onClick={() => openEditor()} className="bg-gradient-gold text-primary-foreground font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nuevo artículo
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <div
                key={post.id}
                className="glass-dark rounded-xl p-5 flex items-center gap-4 enter-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {post.cover_image ? (
                  <img src={post.cover_image} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">{post.title}</h3>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
                    {post.category && <span className="text-primary">{post.category.name}</span>}
                    <span>{new Date(post.created_at).toLocaleDateString("es-ES")}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                    post.status === "published"
                      ? "bg-green-900/40 text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {post.status === "published" ? (
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Publicado</span>
                  ) : (
                    <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Borrador</span>
                  )}
                </span>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEditor(post)} className="hover:text-primary">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(post.id)} className="hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-dark rounded-2xl">
            <p className="text-muted-foreground mb-4">No hay artículos aún</p>
            <Button onClick={() => openEditor()} className="bg-gradient-gold text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Crear primer artículo
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

const AdminBlog = () => (
  <AdminAuthGate>
    {() => <AdminBlogContent />}
  </AdminAuthGate>
);

export default AdminBlog;
