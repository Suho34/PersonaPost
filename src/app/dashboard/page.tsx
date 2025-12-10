"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingForm from "@/components/onboarding-form";
import {
  User,
  Sparkles,
  Copy,
  LogOut,
  Check,
  Trash2,
  Pencil,
  X,
  Save,
} from "lucide-react";

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editing State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Fetch posts when page loads
  useEffect(() => {
    if (session) {
      fetch("/api/posts")
        .then((res) => res.json())
        .then((data) => setPosts(data.posts || []));
    }
  }, [session]);

  const [selectedPlatform, setSelectedPlatform] = useState<
    "twitter" | "linkedin" | "instagram"
  >("linkedin");

  const handleGenerate = async () => {
    console.log("Generating with:", { selectedPlatform });
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          topic: "General brand awareness",
          platform: selectedPlatform,
        }),
      });
      if (res.ok) {
        // Refresh list
        const data = await fetch("/api/posts").then((r) => r.json());
        setPosts(data.posts);
      } else {
        const err = await res.json();
        alert(err.error || "Error generating posts");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating posts");
    } finally {
      setIsGenerating(false);
    }
  };



  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } else {
        alert("Failed to delete post");
      }
    } catch {
      alert("Error deleting post");
    }
  };

  const startEditing = (post: any) => {
    setEditingPostId(post._id);
    setEditContent(post.content);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const saveEdit = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, content: editContent } : p))
        );
        setEditingPostId(null);
        setEditContent("");
      } else {
        alert("Failed to update post");
      }
    } catch {
      alert("Error updating post");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);

    // Track Analytics
    fetch("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify({ postId: id }),
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );

  if (!session) return null;

  return (
    <div
      className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 text-gray-900 pb-20"
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Navbar */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10 shadow-2xl shadow-black/5">
        <div className="max-w-6xl mx-auto px-4 lg:px-7 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
              P
            </div>
            <span className="font-semibold text-lg tracking-tighter">
              PersonaPost
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-full border border-white/30 shadow-2xl shadow-black/5">
              <User size={16} />
              <span className="font-medium tracking-wide">
                {session.user.name}
              </span>
            </div>
            <button
              onClick={async () => {
                await authClient.signOut({
                  fetchOptions: { onSuccess: () => router.push("/") },
                });
              }}
              className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 lg:px-7 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Controls (Onboarding + Actions) */}
          <div className="lg:col-span-4 space-y-7">
            {/* 1. Onboarding Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/5 border border-white/30 overflow-hidden">
              <div className="p-8">
                <OnboardingForm />
              </div>
            </div>

            {/* 2. Generation Trigger Card */}
            {/* 2. Generation Trigger Card */}
            <div className="bg-linear-to-br from-blue-600 via-blue-600 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/30 text-white p-6 lg:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                </svg>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight">
                  Generate Content
                </h2>
              </div>

              <p className="text-blue-100 text-sm mb-7 leading-relaxed tracking-wide">
                Create fresh, on-brand posts based on your latest website data
              </p>

              {/* Platform Selector */}
              <div className="flex gap-2 mb-6 bg-blue-700/50 p-1 rounded-xl">
                {(["linkedin", "twitter", "instagram"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${selectedPlatform === p
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-blue-200 hover:text-white"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-linear-to-r from-white to-blue-50 text-blue-700 font-semibold py-3.5 px-5 rounded-xl hover:shadow-2xl hover:shadow-white/30 transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="tracking-wide">Reading & Writing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span className="tracking-wide">Generate {selectedPlatform} Drafts</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Results Feed */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                Your Feed
              </h2>
              <span className="text-sm text-gray-500 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-2xl shadow-black/5 tracking-wide">
                {posts.length} drafts available
              </span>
            </div>

            <div className="space-y-5">
              {posts.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300/50 p-16 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/5">
                  <div className="w-16 h-16 bg-linear-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-5 text-gray-300">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                    No drafts yet
                  </h3>
                  <p className="text-gray-500 max-w-sm mt-2 leading-relaxed tracking-wide">
                    Configure your brand URL on the left and click
                    &quot;Generate&quot; to see the magic happen
                  </p>
                </div>
              ) : (
                posts.map((post: any) => (
                  <div
                    key={post._id}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-white/30 shadow-2xl shadow-black/5 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-5">
                      <div className="flex-1 w-full">
                        {/* Tag */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${post.platform === 'twitter' ? 'text-sky-600 bg-sky-50' :
                              post.platform === 'instagram' ? 'text-pink-600 bg-pink-50' :
                                'text-blue-600 bg-blue-50'
                              }`}>
                              {post.platform || "LinkedIn"}
                            </span>
                            <span className="text-[10px] text-gray-400 tracking-wider">
                              {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          {/* Copy Count Badge */}
                          {post.copyCount > 0 && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={10} /> Used {post.copyCount} times
                            </span>
                          )}
                        </div>

                        {/* Viral Score & Feedback */}
                        {post.viralScore !== undefined && (
                          <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start gap-3">
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${post.viralScore >= 80 ? 'bg-green-100 text-green-700' :
                              post.viralScore >= 60 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                              {post.viralScore}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">AI Feedback</h4>
                              <p className="text-xs text-gray-600 leading-relaxed italic">
                                &quot;{post.feedback || "Analyze score for details."}&quot;
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        {editingPostId === post._id ? (
                          <div className="w-full animate-in fade-in zoom-in-95 duration-200">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full min-h-[120px] p-4 rounded-xl border-2 border-blue-100 bg-white focus:border-blue-500 focus:ring-0 outline-none text-gray-700 text-[15px] leading-relaxed resize-y mb-4 transition-all"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => saveEdit(post._id)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                <Save size={14} /> Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                              >
                                <X size={14} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px] tracking-wide">
                            {post.content}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={() => copyToClipboard(post.content, post._id)}
                          className={`shrink-0 p-3 rounded-xl transition-all duration-300 ${copiedId === post._id
                            ? "bg-linear-to-br from-green-50 to-emerald-50 text-green-700 shadow-lg shadow-green-500/20"
                            : "bg-gray-50/80 text-gray-500 hover:bg-linear-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 shadow-lg shadow-black/5 hover:shadow-blue-500/20"
                            }`}
                          title="Copy to clipboard"
                        >
                          {copiedId === post._id ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>

                        <button
                          onClick={() => startEditing(post)}
                          disabled={editingPostId === post._id}
                          className="shrink-0 p-3 rounded-xl bg-gray-50/80 text-gray-500 hover:bg-white hover:text-amber-600 shadow-lg shadow-black/5 hover:shadow-amber-500/20 transition-all duration-300 disabled:opacity-50"
                          title="Edit post"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(post._id)}
                          className="shrink-0 p-3 rounded-xl bg-gray-50/80 text-gray-500 hover:bg-white hover:text-red-500 shadow-lg shadow-black/5 hover:shadow-red-500/20 transition-all duration-300"
                          title="Delete post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main >
    </div >
  );
}
