"use client";

import { useEffect, useState } from "react";
import { getAllComments, adminDeleteComment, AdminComment } from "@/lib/admin";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatTime(timestamp: Timestamp | null): string {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate();
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const data = await getAllComments(200);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa comment này?")) return;

    setDeleting(commentId);
    try {
      await adminDeleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Không thể xóa comment");
    } finally {
      setDeleting(null);
    }
  };

  const filteredComments = comments.filter((comment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      comment.userName.toLowerCase().includes(query) ||
      comment.content.toLowerCase().includes(query) ||
      comment.comicSlug.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Quản lý Comments</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">
            {filteredComments.length} / {comments.length} comments
          </span>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-4 text-sm font-semibold">User</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Nội dung</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Truyện</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Thời gian</th>
              <th className="text-right px-6 py-4 text-sm font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredComments.map((comment) => (
              <tr key={comment.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{comment.userName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm line-clamp-2 max-w-[300px]">{comment.content}</p>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/truyen/${comment.comicSlug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {comment.comicSlug}
                    {comment.chapterName && ` (Ch. ${comment.chapterName})`}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">
                    {formatTime(comment.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deleting === comment.id}
                    className="cursor-pointer"
                  >
                    {deleting === comment.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Xóa"
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredComments.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "Không tìm thấy comment nào" : "Chưa có comment nào"}
          </div>
        )}
      </div>
    </div>
  );
}
