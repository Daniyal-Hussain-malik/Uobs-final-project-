import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogShow() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const res = await api.get(`/public/blog/${slug}`);
        if (res.success) {
          setPost(res.post);
          setRelated(res.related || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) return <div className="text-center py-24 text-[#A6ADA1]">Loading article...</div>;
  if (!post) return <div className="text-center py-24 text-[#A6ADA1]">Article not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <Link to="/blog" className="inline-flex items-center text-xs text-[#A6ADA1] hover:text-[#C5A880] transition gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Journal
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <span className="bg-[#6D7C5D]/30 text-[#C5A880] text-xs font-semibold uppercase px-3 py-1 rounded-full border border-white/10">
          {post.category}
        </span>
        <h1 className="font-display text-3xl sm:text-5xl text-[#EAEBE8] font-bold leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center space-x-4 text-xs text-[#A6ADA1]">
          <span>By {post.author_name}</span>
          <span>•</span>
          <span>Gilgit-Baltistan Travel Bureau</span>
        </div>
      </div>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="rounded-3xl overflow-hidden aspect-[16/9] shadow-2xl border border-white/10">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <article className="prose prose-invert max-w-none text-sm text-[#EAEBE8]/90 font-light leading-relaxed space-y-4">
        {post.content.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed">{paragraph}</p>
        ))}
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-white/10 space-y-6">
          <h3 className="font-display text-2xl text-[#EAEBE8] font-bold">Recommended Reading</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/blog/${r.slug}`}
                className="glass-card p-5 rounded-2xl block hover:border-[#6D7C5D] transition space-y-2"
              >
                <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-semibold">{r.category}</span>
                <h4 className="font-display text-base font-bold text-[#EAEBE8] line-clamp-1">{r.title}</h4>
                <p className="text-xs text-[#A6ADA1] line-clamp-2">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
