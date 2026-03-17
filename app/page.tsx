import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { TechStack } from "./components/TechStack";
import { ProjectsSection } from "./components/ProjectsSection";
import { ContactSection } from "./components/ContactSection";
import { WhatsAppFloatButton } from "./components/WhatsAppFloatButton";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="pb-20">
        <HeroSection />
        <TechStack />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFloatButton />
    </div>
  );
}
