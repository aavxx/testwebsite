import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Category = "starters" | "mains" | "desserts";

interface MenuItem {
  name: { da: string; en: string };
  desc: { da: string; en: string };
  price: string;
  tag?: { da: string; en: string };
}

const menuData: Record<Category, MenuItem[]> = {
  starters: [
    {
      name: { da: "Røget laks & rugbrød", en: "Smoked salmon & rye bread" },
      desc: { da: "Hjemmerøget laks, syrnet fløde, dild og sprødt rugbrød", en: "House-smoked salmon, cultured cream, dill and crispy rye" },
      price: "145",
      tag: { da: "Signaturret", en: "Signature" },
    },
    {
      name: { da: "Stenbiderrogn", en: "Lumpfish roe" },
      desc: { da: "Dansk stenbiderrogn, cremefraiche 38%, løgkarse", en: "Danish lumpfish roe, 38% crème fraîche, chives" },
      price: "175",
    },
    {
      name: { da: "Brændt selleri", en: "Charred celeriac" },
      desc: { da: "Helbagt selleri, hasselnødder, æble og brunet smør", en: "Whole-baked celeriac, hazelnuts, apple and brown butter" },
      price: "125",
    },
    {
      name: { da: "Syltet grønkål", en: "Pickled kale" },
      desc: { da: "Fermenteret grønkål, spelt, syltede valnødder, urteolie", en: "Fermented kale, spelt, pickled walnuts, herb oil" },
      price: "115",
    },
  ],
  mains: [
    {
      name: { da: "Pighvar fra Nordsøen", en: "North Sea turbot" },
      desc: { da: "Pighvar, muslingesauce, vinterurter og sprøde kapers", en: "Turbot, mussel sauce, winter herbs and crispy capers" },
      price: "345",
      tag: { da: "Chefens valg", en: "Chef's choice" },
    },
    {
      name: { da: "Hjortekølle", en: "Venison haunch" },
      desc: { da: "Skovhjort, grillet porretop, porcini og enebærsauce", en: "Forest venison, grilled leek, porcini and juniper sauce" },
      price: "365",
    },
    {
      name: { da: "Grillet Bornholmerlam", en: "Grilled Bornholm lamb" },
      desc: { da: "Lammekoteletter, syltede roser, kartoffelmos og timian", en: "Lamb chops, pickled roses, mashed potato and thyme" },
      price: "325",
    },
    {
      name: { da: "Ørred & havtorn", en: "Trout & sea buckthorn" },
      desc: { da: "Dambred ørred, havtornesmør, ristede rug og purløg", en: "Farm trout, sea buckthorn butter, toasted rye and chives" },
      price: "285",
    },
  ],
  desserts: [
    {
      name: { da: "Skyr & havtorn", en: "Skyr & sea buckthorn" },
      desc: { da: "Islandsk skyr, havtorngel, granola og blomst", en: "Icelandic skyr, sea buckthorn gel, granola and flower" },
      price: "115",
    },
    {
      name: { da: "Karameliseret æble", en: "Caramelised apple" },
      desc: { da: "Bagt æble, kærnemælksis, maltkaramel og timiangel", en: "Baked apple, buttermilk ice cream, malt caramel and thyme gel" },
      price: "125",
      tag: { da: "Sæsonens ret", en: "Seasonal" },
    },
    {
      name: { da: "Rugbrødsmousse", en: "Rye bread mousse" },
      desc: { da: "Mørk rugbrødsmousse, saltet karamel og syltede solbær", en: "Dark rye mousse, salted caramel and pickled blackcurrants" },
      price: "115",
    },
  ],
};

export default function MenuSection() {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState<Category>("starters");

  const categories: { id: Category; label: string }[] = [
    { id: "starters", label: t("menu_starters") },
    { id: "mains", label: t("menu_mains") },
    { id: "desserts", label: t("menu_desserts") },
  ];

  return (
    <section id="menu" className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-widest-plus text-stone uppercase mb-4">
            {t("menu_tag")}
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-5">
            {t("menu_title")}
          </h2>
          <p className="font-body text-base text-stone max-w-lg mx-auto">
            {t("menu_subtitle")}
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex justify-center gap-0 border-b border-border mb-12">
          {categories.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`font-body text-xs tracking-widest-plus uppercase px-8 py-3 border-b-2 transition-all ${
                active === id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-stone hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <div className="space-y-0">
          {menuData[active].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-6 py-7 border-b border-border last:border-0 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="font-display text-xl text-foreground">
                    {item.name[lang]}
                  </h3>
                  {item.tag && (
                    <span className="font-body text-xs tracking-widest-plus uppercase text-birch border border-birch/30 px-2 py-0.5">
                      {item.tag[lang]}
                    </span>
                  )}
                </div>
                <p className="font-body text-sm text-stone">{item.desc[lang]}</p>
              </div>
              <span className="font-display text-xl text-foreground shrink-0 pt-0.5">
                {item.price}
                <span className="text-sm text-stone ml-1">kr</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
