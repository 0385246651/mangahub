"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { addComment, getChapterComments, getAllComicComments, deleteComment, Comment } from "@/lib/comments";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";

interface CommentSectionProps {
  comicSlug: string;
  chapterName?: string;
}

function formatTime(timestamp: Timestamp | null): string {
  if (!timestamp) return "Vừa xong";
  const date = timestamp.toDate();
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

function getInitials(name: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CommentSection({ comicSlug, chapterName }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [comicSlug, chapterName]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = chapterName
        ? await getChapterComments(comicSlug, chapterName)
        : await getAllComicComments(comicSlug);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    setSubmitting(true);
    try {
      await addComment({
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        ...(user.photoURL ? { userAvatar: user.photoURL } : {}),
        content: content.trim(),
        comicSlug,
        ...(chapterName ? { chapterName } : {}),
      });
      setContent("");
      await loadComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Không thể gửi bình luận. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Bình luận ({comments.length})
      </h3>

      {/* Comment Input */}
      {user ? (
        <div className="flex gap-3 mb-6">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Viết bình luận của bạn..."
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="cursor-pointer"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Gửi bình luận
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-muted-foreground mb-2">Đăng nhập để bình luận</p>
          <Button asChild variant="outline" className="cursor-pointer">
            <Link href="/dang-nhap">Đăng nhập</Link>
          </Button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-4 bg-card rounded-lg border border-border">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={comment.userAvatar} />
                <AvatarFallback className="bg-muted">
                  {getInitials(comment.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{comment.userName}</span>
                    {comment.chapterName && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Ch. {comment.chapterName}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
                {user?.uid === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-destructive hover:underline mt-2 cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      )}
    </div>
  );
}
