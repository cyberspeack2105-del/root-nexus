import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllProjects } from "@/lib/db";
import { serializeProjects } from "@/lib/serialize";
import FeaturedProjectsSection from "@/components/work/FeaturedProjectsSection";
import ProjectGrid from "@/components/work/ProjectGrid";

export const revalidate = 86400; // 24h ISR

export default async function WorkListPage() {
  let projects = await getAllProjects().catch(() => []);
  const serialized = serializeProjects(projects);

  const hasFeatured = serialized.some(p => p.isFeatured);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-40 pb-16 relative overflow-hidden bg-grid">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold text-primary tracking-[0.35em] uppercase mb-5">
              Our Portfolio
            </p>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Crafting Digital{" "}
              <span className="text-gradient">Masterpieces</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/50 leading-relaxed max-w-2xl mx-auto">
              Discover how we connect foundational roots with modern digital
              nexus to drive real-world results for our clients.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-10 mt-12">
              {[
                { label: 'Projects Delivered', value: `${serialized.length}+` },
                { label: 'Happy Clients', value: '100%' },
                { label: 'Industries', value: `${new Set(serialized.map(p => p.category)).size}` },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-display font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-foreground/40 tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Projects ── */}
      {hasFeatured && <FeaturedProjectsSection projects={serialized} />}

      {/* ── All Projects Grid ── */}
      <section id="all-projects" className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-3">
                {hasFeatured ? 'All Work' : 'Our Work'}
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                {hasFeatured ? 'Every Project' : 'Case Studies'}
              </h2>
            </div>
            <p className="text-sm text-foreground/30 hidden md:block">
              {serialized.length} {serialized.length === 1 ? 'project' : 'projects'}
            </p>
          </div>

          <ProjectGrid projects={serialized} />
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="glass rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
            <p className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 relative z-10">
              Ready to build something great?
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 relative z-10">
              Let&apos;s create your next{" "}
              <span className="text-gradient">success story</span>
            </h2>
            <p className="text-foreground/50 max-w-xl mx-auto mb-8 relative z-10">
              Join our growing list of satisfied clients and see how Root Nexus
              can transform your digital presence.
            </p>
            <a
              href="https://wa.me/919715555430"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-black font-bold rounded-2xl hover:bg-primary/90 transition-all transform hover:-translate-y-1 active:scale-95 relative z-10"
            >
              Start Your Project
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
