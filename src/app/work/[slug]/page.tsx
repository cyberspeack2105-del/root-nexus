import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Calendar, User, Tag, ArrowRight } from "lucide-react";
import { portfolioData } from "@/data/portfolio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export async function generateStaticParams() {
  return portfolioData.map((project) => ({
    slug: project.slug,
  }));
}

export default async function WorkDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = portfolioData.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-6 relative z-10">
          <Link
            href="/#work"
            className="inline-flex items-center space-x-2 text-foreground/40 hover:text-primary transition-all mb-8 md:mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs md:text-sm font-bold tracking-widest uppercase">Back to Portfolio</span>
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-end">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass border border-white/10 text-primary text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-6 md:mb-8">
                <Tag className="w-3 h-3" />
                <span>{project.category}</span>
              </div>
              <h1 className="text-4xl md:text-8xl font-display font-bold mb-6 md:mb-8 leading-[1.1] md:leading-[0.9] tracking-tight">
                {project.title.split(' ').map((word, i) => (
                  <span key={i} className={i === project.title.split(' ').length - 1 ? "text-gradient block" : "block md:inline lg:block"}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
            </div>
            <div className="pb-2 md:pb-4">
              <p className="text-lg md:text-2xl text-foreground/60 leading-relaxed font-light">
                {project.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image Section */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-6">
          <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[1.5rem] md:rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl group">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-60" />
          </div>
        </div>
      </section>

      {/* Stats/Quick Info Bar */}
      <section className="py-8 md:py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="space-y-1">
              <p className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Client</p>
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary/60" />
                <p className="text-base md:text-lg font-medium">{project.client}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Timeline</p>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary/60" />
                <p className="text-base md:text-lg font-medium">{project.timeline}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Services</p>
              <p className="text-base md:text-lg font-medium">{project.category}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Status</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-base md:text-lg font-medium text-emerald-500">Live</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content & Results Section */}
      <section className="py-16 md:py-32 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
            {/* Project Story */}
            <div className="lg:col-span-7">
              <div className="space-y-10 md:space-y-12">
                <div>
                  <h2 className="text-[10px] md:text-sm font-bold text-primary tracking-[0.3em] uppercase mb-4 md:mb-6">The Challenge</h2>
                  <p className="text-xl md:text-3xl text-foreground/90 font-light leading-relaxed">
                    {project.content}
                  </p>
                </div>
                
                <div className="h-px w-16 md:w-24 bg-primary/30" />
                
                <div>
                  <h2 className="text-[10px] md:text-sm font-bold text-primary tracking-[0.3em] uppercase mb-4 md:mb-6">The Solution</h2>
                  <div className="prose prose-invert prose-lg md:prose-xl max-w-none text-foreground/60 font-light leading-relaxed space-y-4">
                    <p>
                      Our approach centered on identifying the core friction points in the user journey. 
                      By applying "The Root" analysis, we stripped away unnecessary complexities and 
                      focused on the essential value proposition.
                    </p>
                    <p>
                      We then built a "The Nexus" connection, bridging high-end technology with 
                      intuitive design patterns. This ensured that the final product wasn't just 
                      functional, but truly immersive and impactful for the end user.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Results Card */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <h3 className="text-2xl md:text-3xl font-display font-bold mb-8 md:mb-10">Impact & <span className="text-gradient">Results</span></h3>
                  
                  <div className="space-y-6 md:space-y-8">
                    {project.results.map((result, i) => (
                      <div key={i} className="flex items-center space-x-4 md:space-x-5 group/item">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors shrink-0">
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <span className="text-lg md:text-xl font-medium text-foreground/80">{result}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 md:mt-12 pt-8 md:pt-10 border-t border-white/5">
                    <Link 
                      href="https://wa.me/919715555430" 
                      className="w-full py-4 md:py-5 px-6 md:px-8 bg-foreground text-background rounded-xl md:rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                      <span className="text-sm md:text-base">Start Your Project</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </main>
  );
}

