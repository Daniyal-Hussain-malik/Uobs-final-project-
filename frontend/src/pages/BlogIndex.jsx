import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, User } from 'lucide-react';

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    async function loadBlog() {
      try {
        let url = '/public/blog';
        if (activeCategory) url += `?category=${encodeURIComponent(activeCategory)}`;
        const res = await api.get(url);
        if (res.success) {
          setPosts(res.posts);
          if (categories.length === 0) setCategories(res.categories);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadBlog();
  }, [activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-semibold">
          Karakoram Dispatch
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-[#EAEBE8] font-bold">
          The Oasis Journal & Guides
        </h1>
        <p className="text-xs text-[#A6ADA1]">
          Essential travel itineraries, altitude preparation guides, and seasonal highlights of Gilgit-Baltistan.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              !activeCategory ? 'bg-[#C5A880] text-[#121813] font-bold' : 'bg-white/5 text-[#EAEBE8]/80 hover:bg-white/10'
            }`}
          >
            All Articles
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                activeCategory === c ? 'bg-[#C5A880] text-[#121813] font-bold' : 'bg-white/5 text-[#EAEBE8]/80 hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="glass-card rounded-2xl overflow-hidden flex flex-col hover:border-[#6D7C5D] transition">
            <img src={post.cover_image} alt={post.title} className="aspect-[16/10] w-full object-cover" />
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-semibold">{post.category}</span>
                <h3 className="font-display text-xl font-bold text-[#EAEBE8] leading-snug">{post.title}</h3>
                <p className="text-xs text-[#A6ADA1] line-clamp-3 leading-relaxed">{post.excerpt}</p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#A6ADA1] text-[11px]">{post.author_name}</span>
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-[#C5A880] font-semibold flex items-center gap-1 hover:underline"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
