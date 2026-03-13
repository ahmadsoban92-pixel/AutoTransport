"use client";

import { useState } from "react";
import { Star, Send, User, MessageCircle, CheckCircle } from "lucide-react";
import Image from "next/image";

interface Review {
    name: string;
    rating: number;
    text: string;
    date: string;
}

const existingReviews: Review[] = [
    {
        name: "Ahmed Khan",
        rating: 5,
        text: "Excellent service! My car was delivered on time and in perfect condition. The team was very professional and kept me updated throughout the entire process.",
        date: "Feb 2026",
    },
    {
        name: "Sarah Williams",
        rating: 5,
        text: "I was nervous about shipping my classic car across the country, but AutoTransportPro made it so easy. The enclosed transport option gave me total peace of mind.",
        date: "Jan 2026",
    },
    {
        name: "Mohammad Rizwan",
        rating: 4,
        text: "Good experience overall. The quote was accurate and there were no hidden fees. Delivery took one extra day but they communicated the delay well.",
        date: "Jan 2026",
    },
    {
        name: "Emily Chen",
        rating: 5,
        text: "Used their expedited service for a last-minute move and they delivered! My Toyota arrived two days early. Will definitely use again.",
        date: "Dec 2025",
    },
    {
        name: "James Mitchell",
        rating: 5,
        text: "Third time using their service. Consistent quality every time. The door-to-door option is incredibly convenient. Highly recommend!",
        date: "Dec 2025",
    },
    {
        name: "Fatima Zahra",
        rating: 4,
        text: "Very responsive customer support. Had a question about insurance coverage and Faisal helped me understand everything clearly. Great team!",
        date: "Nov 2025",
    },
];

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <button
                    key={i}
                    type={interactive ? "button" : undefined}
                    onClick={() => interactive && onChange?.(i)}
                    className={interactive ? "cursor-pointer" : "cursor-default"}
                    disabled={!interactive}
                >
                    <Star
                        className={`w-5 h-5 ${i <= rating ? "text-orange-400 fill-orange-400" : "text-blue-800"}`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>(existingReviews);
    const [form, setForm] = useState({ name: "", rating: 5, text: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.text.trim()) return;

        const newReview: Review = {
            name: form.name,
            rating: form.rating,
            text: form.text,
            date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        };
        setReviews([newReview, ...reviews]);
        setForm({ name: "", rating: 5, text: "" });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
    };

    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

    return (
        <div className="min-h-screen bg-[#060d1f] pt-28 pb-16">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-14">
                    <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Customer Reviews</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">What Our Customers Say</h1>
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <StarRating rating={Math.round(Number(avgRating))} />
                        <span className="text-2xl font-bold text-white">{avgRating}</span>
                        <span className="text-blue-400 text-sm">({reviews.length} reviews)</span>
                    </div>
                </div>

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

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1.5">Your Name <span className="text-orange-400">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Your name"
                                        className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
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
                                        value={form.text}
                                        onChange={(e) => setForm({ ...form, text: e.target.value })}
                                        placeholder="Share your experience..."
                                        className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="lg:col-span-2 space-y-4">
                        {reviews.map((review, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/20 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{review.name}</p>
                                            <p className="text-blue-500 text-xs">{review.date}</p>
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="text-blue-300 text-sm leading-relaxed">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
