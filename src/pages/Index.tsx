import { LanguageProvider } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import AboutSection from "@/components/AboutSection";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";
import ChatAssistant from "@/components/ChatAssistant";

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Hero />
          <MenuSection />
          <AboutSection />
          <BookingSection />
        </main>
        <Footer />
        <ChatAssistant />
      </div>
    </LanguageProvider>
  );
};

export default Index;
