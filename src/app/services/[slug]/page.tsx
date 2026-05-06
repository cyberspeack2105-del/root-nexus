import { services } from "@/data/services";
import { notFound } from "next/navigation";
import { Globe, TrendingUp, Cpu, Zap, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const iconMap: any = {
  Globe,
  TrendingUp,
  Cpu,
  Zap,
};

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.id,
  }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.id === slug);

  if (!service) {
    notFound();
  }

  const Icon = iconMap[service.icon];

  return (
    <main className="min-h-screen pt-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link 
          href="/#services" 
          className="inline-flex items-center space-x-2 text-foreground/60 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Services</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side: Content */}
          <div className="space-y-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Icon className="w-8 h-8" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight">
              {service.title.split(' ').map((word, i) => (
                <span key={i} className={i === service.title.split(' ').length - 1 ? "text-primary" : ""}>
                  {word}{' '}
                </span>
              ))}
            </h1>

            <p className="text-xl text-foreground/70 leading-relaxed max-w-xl">
              {service.details}
            </p>

            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-semibold">Core Capabilities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3 text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link 
                href="/#contact"
                className="inline-flex items-center px-8 py-4 rounded-full bg-primary text-black font-bold hover:bg-primary/90 transition-all hover:scale-105"
              >
                Start Your Project
              </Link>
            </div>
          </div>

          {/* Right Side: Visual Element */}
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden glass border-white/10 flex items-center justify-center p-12 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
            
            {/* Decorative Blobs */}
            <div className="absolute top-1/4 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-10 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] animate-pulse delay-700" />
            
            <div className="relative z-10 text-center space-y-6">
              <Icon className="w-32 h-32 mx-auto text-primary animate-bounce-slow" />
              <div className="space-y-2">
                <div className="h-2 w-24 bg-primary/30 mx-auto rounded-full" />
                <div className="h-2 w-48 bg-primary/10 mx-auto rounded-full" />
                <div className="h-2 w-32 bg-primary/20 mx-auto rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
