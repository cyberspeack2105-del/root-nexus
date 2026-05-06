export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

export const insightsData: BlogPost[] = [
  {
    id: "1",
    title: "The Future of AI in Modern Web Ecosystems",
    slug: "future-of-ai-web-ecosystems",
    date: "May 5, 2024",
    category: "Technology",
    readTime: "6 min read",
    excerpt: "Explore how artificial intelligence is moving beyond chatbots and into the very core of web architecture and user experience.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
    author: {
      name: "Root Nexus AI",
      role: "Strategic Partner",
      avatar: "/logo.png"
    },
    content: `
      Artificial Intelligence is no longer just a buzzword; it is becoming the foundational layer of the modern digital ecosystem. At Root Nexus, we see AI not just as a tool for automation, but as a catalyst for personalization and efficiency.

      ### The Shift to Intelligent Interfaces
      Gone are the days of static layouts. We are moving toward "Generative UI" where the interface adapts in real-time to user behavior and intent. This reduces friction and makes digital products feel like a natural extension of the user.

      ### Predictive Data Pipelines
      Data is the root, and AI is the nexus that connects it to actionable insights. By implementing smart data pipelines, businesses can predict market shifts and customer needs before they even happen.

      Stay tuned as we continue to push the boundaries of what is possible at the intersection of AI and Web Development.
    `
  },
  {
    id: "2",
    title: "Why 'The Root' Matters: Foundations of Digital Strategy",
    slug: "why-the-root-matters",
    date: "April 28, 2024",
    category: "Strategy",
    readTime: "4 min read",
    excerpt: "Most digital projects fail because they ignore the foundations. Learn our methodology for building scalable roots for your brand.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    author: {
      name: "Admin",
      role: "Founder",
      avatar: "/logo.png"
    },
    content: `
      In architecture, the strength of a skyscraper is determined by its foundation. The same applies to digital products. If your "Root" is weak, your growth will be capped.

      ### What is a Digital Root?
      A root consists of three core elements: Brand Identity, Data Architecture, and Scalable Infrastructure. Without these, any marketing or expansion effort is just temporary.

      ### Connecting to the Nexus
      Once the root is solid, we can create the "Nexus"—the point of connection where your brand meets the global digital ecosystem. This is where growth happens.
    `
  },
  {
    id: "3",
    title: "Maximizing ROI through Smart Automation",
    slug: "maximizing-roi-automation",
    date: "April 15, 2024",
    category: "Automation",
    readTime: "5 min read",
    excerpt: "Stop wasting hours on repetitive tasks. We break down the top automation workflows that drive real business growth in 2024.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    author: {
      name: "Root Nexus Tech",
      role: "Engineering Lead",
      avatar: "/logo.png"
    },
    content: `
      Efficiency is the new currency. In 2024, businesses that don't automate are essentially paying a "manual tax" on their growth.

      ### Low-Hanging Fruit in Automation
      1. **Lead Qualification:** Use smart forms to filter prospects automatically.
      2. **Content Distribution:** Use AI to repurpose and schedule content across platforms.
      3. **Customer Support:** Implement RAG-based AI agents to handle 80% of routine queries.

      By automating these tasks, your team can focus on "High-Value" work—the kind of work that actually moves the needle.
    `
  }
];
