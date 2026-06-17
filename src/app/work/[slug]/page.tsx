import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Calendar, User, Tag,
  ArrowRight, ExternalLink, MonitorPlay, Home, ChevronRight
} from "lucide-react";
import { getProjectBySlug, getAllProjects } from "@/lib/db";
import { serializeProject, serializeProjects } from "@/lib/serialize";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/work/ProjectCard";
import ProjectGallery from "@/components/work/ProjectGallery";

export default async function WorkDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dbProject = await getProjectBySlug(slug);

  if (!dbProject) notFound();

  const project = serializeProject(dbProject);

  const galleryImages = [
    project.image,
    ...(project.screenshots || [])
  ];

  // Fetch related projects (same category, exclude current)
  let related: Omit<import('@/types/admin').Project, '_id'>[] = [];
  try {
    const all = await getAllProjects();
    related = serializeProjects(all)
      .filter(p => p.category === project.category && p.id !== project.id)
      .slice(0, 3);
  } catch {}

  return (
    <main className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-foreground/30 mb-8 md:mb-10">
            <Link href="/" className="hover:text-foreground/60 transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/work" className="hover:text-foreground/60 transition-colors">Work</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/50 truncate max-w-[200px]">{project.title}</span>
          </nav>

          {/* Back link */}
          <Link
            href="/work"
            className="inline-flex items-center space-x-2 text-foreground/40 hover:text-primary transition-all mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs md:text-sm font-bold tracking-widest uppercase">
              Back to Portfolio
            </span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-end">
            <div>
              {/* Category + tags */}
              <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full glass border border-white/10 text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Tag className="w-3 h-3" />
                  <span>{project.category}</span>
                </div>
                {project.tags?.map(tag => (
                  <span key={tag} className="text-[10px] font-medium text-foreground/40 px-2.5 py-1 rounded-full border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight tracking-tight break-words">
                <span className="text-gradient">{project.title}</span>
              </h1>
            </div>

            <div className="pb-2 space-y-6">
              <p className="text-lg md:text-2xl text-foreground/60 leading-relaxed font-light">
                {project.shortDescription}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 glass border border-white/10 text-foreground font-bold rounded-xl hover:border-primary/40 hover:text-primary transition-all text-sm"
                  >
                    <MonitorPlay className="w-4 h-4" />
                    View Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hero Image Gallery ── */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-6">
          <ProjectGallery images={galleryImages} title={project.title} />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-8 md:py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { label: 'Client', value: project.client, icon: <User className="w-4 h-4 text-primary/60" /> },
              { label: 'Timeline', value: project.timeline, icon: <Calendar className="w-4 h-4 text-primary/60" /> },
              { label: 'Services', value: project.category, icon: <Tag className="w-4 h-4 text-primary/60" /> },
              { label: 'Status', value: 'Live', icon: <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="space-y-1">
                <p className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">{label}</p>
                <div className="flex items-center space-x-2">
                  {icon}
                  <p className={`text-base md:text-lg font-medium ${label === 'Status' ? 'text-emerald-500' : ''}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content & Results ── */}
      <section className="py-16 md:py-32 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
            {/* Story */}
            <div className="lg:col-span-7 space-y-10 md:space-y-12">
              <div>
                <h2 className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 md:mb-6">The Challenge</h2>
                <p className="text-base md:text-lg text-foreground/80 font-normal leading-relaxed">
                  {project.content}
                </p>
              </div>

              <div className="h-px w-16 md:w-24 bg-primary/30" />

              <div>
                <h2 className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 md:mb-6">The Solution</h2>
                <div className="text-foreground/60 font-light leading-relaxed space-y-4 text-lg md:text-xl">
                  <p>
                    Our approach centered on identifying the core friction points in the user journey.
                    By applying &quot;The Root&quot; analysis, we stripped away unnecessary complexities and
                    focused on the essential value proposition.
                  </p>
                  <p>
                    We then built &quot;The Nexus&quot; connection, bridging high-end technology with
                    intuitive design patterns. This ensured the final product wasn&apos;t just
                    functional, but truly immersive and impactful for the end user.
                  </p>
                </div>
              </div>

              {/* Website/Demo buttons (repeated for mobile) */}
              <div className="flex flex-wrap gap-3 pt-4 md:hidden">
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl text-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> Visit Website
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 glass border border-white/10 text-foreground font-bold rounded-xl text-sm"
                  >
                    <MonitorPlay className="w-4 h-4" /> View Demo
                  </a>
                )}
              </div>
            </div>

            {/* Results card */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                  <h3 className="text-2xl md:text-3xl font-display font-bold mb-8">
                    Impact & <span className="text-gradient">Results</span>
                  </h3>

                  <div className="space-y-5 md:space-y-6">
                    {project.results.map((result, i) => (
                      <div key={i} className="flex items-start space-x-4 group/item">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-base md:text-lg font-medium text-foreground/80 leading-snug">{result}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                    {project.websiteUrl && (
                      <a
                        href={project.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 px-6 bg-primary text-black rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Live Website
                      </a>
                    )}
                    <a
                      href="https://wa.me/919715555430"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-6 bg-foreground text-background rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
                    >
                      Start Your Project
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Projects ── */}
      {related.length > 0 && (
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-3">More Work</p>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Related Projects</h2>
              </div>
              <Link
                href="/work"
                className="hidden md:inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-primary transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/work"
                className="inline-flex items-center gap-2 px-8 py-3 glass border border-white/10 text-foreground/60 font-semibold rounded-xl hover:border-primary/30 hover:text-primary transition-all text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back to All Projects
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
