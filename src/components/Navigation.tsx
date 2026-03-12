import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const { t, lang, setLang } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const menuSectionTop = useRef<number>(0);

  useEffect(() => {
    const updateMenuTop = () => {
      const menuEl = document.getElementById("menu");
      if (menuEl) {
        menuSectionTop.current = menuEl.getBoundingClientRect().top + window.scrollY;
      }
    };
    updateMenuTop();
    window.addEventListener("resize", updateMenuTop);
    // Try again after fonts/images load
    setTimeout(updateMenuTop, 500);
    return () => window.removeEventListener("resize", updateMenuTop);
  }, []);

  useEffect(() => {
    const handler = () => {
      const currentY = window.scrollY;
      const menuTop = menuSectionTop.current;

      if (currentY < menuTop - 80) {
        // Above menu section: always show
        setVisible(true);
      } else {
        // In or below menu: show when scrolling up, hide when scrolling down
        if (currentY < lastScrollY.current) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background/95 backdrop-blur-sm shadow-soft border-b border-border ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-display text-2xl tracking-widest-plus text-foreground hover:text-stone transition-colors font-bold"
        >
          BIRK
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { key: "nav_menu", id: "menu" },
            { key: "nav_about", id: "about" },
            { key: "nav_booking", id: "booking" },
          ].map(({ key, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-body text-sm tracking-widest-plus text-stone hover:text-foreground transition-colors uppercase"
            >
              {t(key)}
            </button>
          ))}

          {/* Lang toggle */}
          <button
            onClick={() => setLang(lang === "da" ? "en" : "da")}
            className="font-body text-xs tracking-widest-plus border border-border px-3 py-1.5 text-stone hover:border-foreground hover:text-foreground transition-all"
          >
            {t("nav_lang")}
          </button>
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setLang(lang === "da" ? "en" : "da")}
            className="font-body text-xs tracking-widest-plus border border-border px-2.5 py-1 text-stone"
          >
            {t("nav_lang")}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 flex flex-col gap-5">
          {[
            { key: "nav_menu", id: "menu" },
            { key: "nav_about", id: "about" },
            { key: "nav_booking", id: "booking" },
          ].map(({ key, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-body text-sm tracking-widest-plus text-stone hover:text-foreground transition-colors uppercase text-left"
            >
              {t(key)}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
