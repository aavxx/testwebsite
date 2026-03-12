import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutSection() {
  const { t } = useLanguage();

  const stats = [
    { label: t("about_label1"), value: t("about_val1") },
    { label: t("about_label2"), value: t("about_val2") },
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-sand">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <p className="font-body text-xs tracking-widest-plus text-stone uppercase mb-4">
              {t("about_tag")}
            </p>
            <h2 className="font-display text-5xl md:text-6xl text-foreground mb-8 leading-tight">
              {t("about_title")}
            </h2>
            <p className="font-body text-base text-stone leading-relaxed mb-5">
              {t("about_p1")}
            </p>
            <p className="font-body text-base text-stone leading-relaxed">
              {t("about_p2")}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-px bg-border">
            {stats.map(({ label, value }) => (
              <div key={label} className="bg-sand p-8 text-center">
                <p className="font-display text-5xl text-foreground mb-2">{value}</p>
                <p className="font-body text-xs tracking-widest-plus text-stone uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider line decoration */}
        <div className="mt-20 flex items-center gap-6">
          <div className="h-px flex-1 bg-border" />
          <span className="font-display text-2xl text-stone italic">Birk</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </section>
  );
}
