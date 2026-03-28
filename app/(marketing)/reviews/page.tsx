"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Send, User, MessageCircle, CheckCircle, Loader2 } from "lucide-react";

interface Review {
  id?: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
}

const SEED_REVIEWS: Review[] = [
  { author_name: "Ahmed Khan", rating: 5, content: "Excellent service! My car was delivered on time and in perfect condition. The team was very professional and kept me updated throughout the entire process.", created_at: "2026-02-01" },
  { author_name: "Sarah Williams", rating: 5, content: "I was nervous about shipping my classic car across the country, but WESAutoTransport made it so easy. The enclosed transport option gave me total peace of mind.", created_at: "2026-01-15" },
  { author_name: "Mohammad Rizwan", rating: 4, content: "Good experience overall. The quote was accurate and there were no hidden fees. Delivery took one extra day but they communicated the delay well.", created_at: "2026-01-05" },
  { author_name: "Emily Chen", rating: 5, content: "Used their expedited service for a last-minute move and they delivered! My Toyota arrived two days early. Will definitely use again.", created_at: "2025-12-20" },
  { author_name: "James Mitchell", rating: 5, content: "Third time using their service. Consistent quality every time. The door-to-door option is incredibly convenient. Highly recommend!", created_at: "2025-12-10" },
  { author_name: "Fatima Zahra", rating: 4, content: "Very responsive customer support. Had a question about insurance coverage and Faisal helped me understand everything clearly. Great team!", created_at: "2025-11-28" },
];

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type={interactive ? "button" : "button"}
          onClick={() => interactive && onChange?.(i)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          disabled={!interactive}
        >
          <Star className={`w-5 h-5 ${i <= rating ? "text-orange-400 fill-orange-400" : "text-blue-800"}`} />
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [form, setForm] = useState({ author_name: "", rating: 5, content: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load real reviews from Supabase on mount, merge with seeds
  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(({ reviews: dbReviews }) => {
        if (dbReviews?.length) {
          setReviews([...dbReviews, ...SEED_REVIEWS]);
        }
      })
      .catch(() => {}); // gracefully fail — seeds are still shown
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.content.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      const newReview: Review = {
        id: data.id,
        ...form,
        created_at: new Date().toISOString(),
      };
      setReviews([newReview, ...reviews]);
      setForm({ author_name: "", rating: 5, content: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-[#060d1f] pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          className="text-center mb-14">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Customer Reviews</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">What Our Customers Say</h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <StarRating rating={Math.round(Number(avgRating))} />
            <span className="text-2xl font-bold text-white">{avgRating}</span>
            <span className="text-blue-400 text-sm">({reviews.length} reviews)</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submit Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6 sticky top-28">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-400" />
                Write a Review
              </h2>

              {submitted && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-900/20 border border-green-700/40 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" /> Thank you for your review!
                </div>
              )}

              {error && (
                <div className="p-3 mb-4 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1.5">Your Name <span className="text-orange-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1.5">Rating</label>
                  <StarRating rating={form.rating} interactive onChange={(r) => setForm({ ...form, rating: r })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1.5">Your Review <span className="text-orange-400">*</span></label>
                  <textarea
                    required
                    rows={4}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Share your experience..."
                    className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Review</>}
                </button>
              </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.07, 0.4) }}
                className="p-6 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{review.author_name}</p>
                      <p className="text-blue-500 text-xs">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-blue-300 text-sm leading-relaxed">{review.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
