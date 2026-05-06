import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WorkSection from "@/components/WorkSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      
      <FadeIn>
        <Services />
      </FadeIn>
      
      {/* Dynamic Section Separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <FadeIn>
        <WorkSection />
      </FadeIn>

      {/* Dynamic Section Separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* About / Philosophy Section Preview */}
      <section id="about" className="py-24 bg-grid relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <FadeIn direction="right">
              <div className="relative">
                <div className="w-full aspect-square glass rounded-[3rem] p-12 relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                  <div className="relative z-20 h-full flex flex-col justify-between">
                    <div className="text-8xl font-bold opacity-10">01</div>
                    <div className="space-y-4">
                      <h4 className="text-3xl font-bold">Foundation</h4>
                      <p className="text-foreground/60 leading-relaxed">
                        Every great achievement begins with a solid root. We analyze 
                        foundational ideas to ensure your digital ecosystem is built 
                        on clarity and purpose.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/30 rounded-full blur-[80px]" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/30 rounded-full blur-[80px]" />
              </div>
            </FadeIn>
            
            <FadeIn direction="left">
              <div className="space-y-8">
                <h2 className="text-sm font-bold text-secondary tracking-widest uppercase">
                  The Nexus Philosophy
                </h2>
                <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  Where Strategy Meets <span className="text-gradient">Pure Execution</span>
                </h3>
                <p className="text-xl text-foreground/60 leading-relaxed">
                  Root Nexus was born from the need to bridge the gap between complex 
                  technology and human-centric business goals. We don&apos;t just provide 
                  services; we provide a nexus—a point of connection where your brand 
                  expands into new digital territories.
                </p>
                <ul className="space-y-4">
                  {[
                    "Agile Development Workflows",
                    "Data-Driven Growth Strategies",
                    "AI-First Automation Engineering",
                    "Immersive Brand Storytelling"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-lg font-medium">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <FadeIn>
        <ContactSection />
      </FadeIn>

      <Footer />
    </main>
  );
}
