import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import { insightsData } from "@/data/insights";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export async function generateStaticParams() {
  return insightsData.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = insightsData.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-grid">
        <div className="container mx-auto px-6 relative z-10">
          <Link
            href="/insights"
            className="inline-flex items-center space-x-2 text-foreground/60 hover:text-primary transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Insights</span>
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center space-x-4 mb-8">
              <span className="px-4 py-2 rounded-full glass text-xs font-bold text-primary uppercase tracking-wider">
                {post.category}
              </span>
              <div className="h-px w-12 bg-white/10" />
              <div className="flex items-center text-sm text-foreground/40 font-medium space-x-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {post.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {post.readTime}
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-12">
              {post.title}
            </h1>

            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary/20">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold">{post.author.name}</p>
                <p className="text-sm text-foreground/40">{post.author.role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="relative aspect-[21/9] w-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-invert prose-lg max-w-none text-foreground/80 leading-relaxed space-y-8">
              {post.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('###')) {
                  return (
                    <h3 key={index} className="text-3xl font-bold text-white pt-8 mb-4">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                return <p key={index}>{paragraph.trim()}</p>;
              })}
            </div>

            {/* Post Actions */}
            <div className="mt-20 pt-12 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-foreground/40 uppercase tracking-wider">Share:</span>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((i) => (
                    <button key={i} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
              <Link
                href="/#contact"
                className="text-primary font-bold hover:underline underline-offset-8"
              >
                Discuss this project →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
