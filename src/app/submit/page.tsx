"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitPage() {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      setError("Vui lòng nhập nội dung");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Save to Firestore "submissions" collection
      await addDoc(collection(db, "submissions"), {
        content: inputValue.trim(),
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setInputValue("");
    } catch (err) {
      console.error("Error saving:", err);
      setError("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Gửi dữ liệu</CardTitle>
          <CardDescription>
            Nhập nội dung và nhấn Submit để lưu lên Firebase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                ✓ Đã lưu thành công!
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Nội dung
              </label>
              <Input
                id="content"
                type="text"
                placeholder="Nhập nội dung..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang lưu...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
