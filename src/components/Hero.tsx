import heroImg from "@/assets/hero.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative h-screen min-h-[640px] flex items-end overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Birk restaurant interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
        <p className="font-body text-xs tracking-widest-plus text-white/60 uppercase mb-4 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          {t("hero_tag")}
        </p>
        <h1
          className="font-display text-7xl md:text-9xl text-white mb-4 leading-none animate-fade-up"
          style={{ animationDelay: "0.25s", opacity: 0 }}
        >
          {t("hero_title")}
        </h1>
        <p
          className="font-body text-base md:text-lg text-white/75 max-w-md mb-10 animate-fade-up"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          {t("hero_subtitle")}
        </p>

        <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.55s", opacity: 0 }}>
          <button
            onClick={() => scrollTo("booking")}
            className="font-body text-sm tracking-widest-plus uppercase px-7 py-3.5 bg-primary text-primary-foreground hover:bg-birch/90 transition-colors"
          >
            {t("hero_cta")}
          </button>
          <button
            onClick={() => scrollTo("menu")}
            className="font-body text-sm tracking-widest-plus uppercase px-7 py-3.5 border border-white/60 text-white hover:bg-white/10 transition-colors"
          >
            {t("hero_menu_cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
