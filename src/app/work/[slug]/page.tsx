import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { portfolioData } from "@/data/portfolio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";

export async function generateStaticParams() {
  return portfolioData.map((project) => ({
    slug: project.slug,
  }));
}

export default function WorkDetails({ params }: { params: { slug: string } }) {
  const project = portfolioData.find((p) => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-grid">
        <div className="container mx-auto px-6 relative z-10">
          <Link
            href="/#work"
            className="inline-flex items-center space-x-2 text-foreground/60 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Work</span>
          </Link>
          
          <div className="max-w-4xl">
            <div className="inline-block px-4 py-2 rounded-full glass border border-white/10 text-primary text-sm font-bold tracking-wider uppercase mb-6">
              {project.category}
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight">
              {project.title}
            </h1>
            <p className="text-xl md:text-2xl text-foreground/60 leading-relaxed">
              {project.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Image */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Content & Results */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Project Details Sidebar */}
            <div className="lg:col-span-1 space-y-12">
              <div className="glass-dark rounded-3xl p-8 border border-white/10">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-2">Client</h4>
                    <p className="text-lg font-medium">{project.client}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-2">Timeline</h4>
                    <p className="text-lg font-medium">{project.timeline}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-2">Services</h4>
                    <p className="text-lg font-medium">{project.category}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-3xl p-8 border border-primary/20 bg-primary/5">
                <h3 className="text-xl font-bold mb-6">Key Results</h3>
                <ul className="space-y-4">
                  {project.results.map((result, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      <span className="font-medium text-lg">{result}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Project Story */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-display font-bold mb-8">The Challenge & Solution</h2>
              <div className="prose prose-invert prose-lg max-w-none text-foreground/80 leading-relaxed">
                <p>{project.content}</p>
                <p>
                  By deeply analyzing the fundamental requirements ("The Root") and 
                  leveraging modern tech stacks and strategic methodologies ("The Nexus"), 
                  we were able to deliver a solution that not only met but exceeded the 
                  client's expectations. Our focus on scalable architecture and user-centric 
                  design ensured long-term viability and growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Section Separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <ContactSection />
      <Footer />
    </main>
  );
}
