import React, { createContext, useContext, useState } from "react";

type Language = "da" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Nav
  nav_menu: { da: "Menu", en: "Menu" },
  nav_about: { da: "Om os", en: "About" },
  nav_booking: { da: "Bestilling", en: "Booking" },
  nav_lang: { da: "EN", en: "DA" },

  // Hero
  hero_tag: { da: "Nordisk køkken · Siden 2026", en: "Nordic cuisine · Since 2026" },
  hero_title: { da: "Birk", en: "Birk" },
  hero_subtitle: { da: "En smagsrejse gennem årstidernes råvarer", en: "A journey through the seasons' finest ingredients" },
  hero_cta: { da: "Bestil bord", en: "Reserve a table" },
  hero_menu_cta: { da: "Se menuen", en: "View menu" },

  // Menu
  menu_tag: { da: "Hvad vi tilbyder", en: "What we offer" },
  menu_title: { da: "Vores menu", en: "Our menu" },
  menu_subtitle: { da: "Sæsonbetonede retter tilberedt med omtanke og respekt for råvaren", en: "Seasonal dishes prepared with care and respect for the ingredients" },
  menu_starters: { da: "Forretter", en: "Starters" },
  menu_mains: { da: "Hovedretter", en: "Main Courses" },
  menu_desserts: { da: "Desserter", en: "Desserts" },

  // About
  about_tag: { da: "Vores historie", en: "Our story" },
  about_title: { da: "Om Birk", en: "About Birk" },
  about_p1: { da: "Birk opstod af en drøm om at bringe det nordiske køkken til sin reneste form — enkelt, sæsonbetonet og ærligt. Vi henter vores råvarer fra lokale gårde og skove, og lader naturen sætte menuen.", en: "Birk was born from a dream to bring Nordic cuisine to its purest form — simple, seasonal, and honest. We source our ingredients from local farms and forests, letting nature set the menu." },
  about_p2: { da: "Vores kokke arbejder tæt med råvaren og skaber retter, der fortæller en historie om det danske landskab og årstidernes skiftende karakter.", en: "Our chefs work closely with each ingredient, crafting dishes that tell the story of the Danish landscape and the changing character of the seasons." },
  about_label1: { da: "Åbnet", en: "Opened" },
  about_val1: { da: "2026", en: "2026" },
  about_label2: { da: "Borde", en: "Tables" },
  about_val2: { da: "18", en: "18" },
  about_label3: { da: "Michelin-stjerner", en: "Michelin stars" },
  about_val3: { da: "1", en: "1" },

  // Booking
  booking_tag: { da: "Reserver din aften", en: "Reserve your evening" },
  booking_title: { da: "Bestil bord", en: "Book a table" },
  booking_subtitle: { da: "Vi glæder os til at byde dig velkommen hos Birk", en: "We look forward to welcoming you to Birk" },
  booking_name: { da: "Navn", en: "Name" },
  booking_email: { da: "E-mail", en: "Email" },
  booking_phone: { da: "Telefon", en: "Phone" },
  booking_date: { da: "Dato", en: "Date" },
  booking_time: { da: "Tidspunkt", en: "Time" },
  booking_guests: { da: "Antal gæster", en: "Number of guests" },
  booking_note: { da: "Særlige ønsker", en: "Special requests" },
  booking_submit: { da: "Send bestilling", en: "Send reservation" },
  booking_success: { da: "Tak for din bestilling! Vi vender tilbage snart.", en: "Thank you for your reservation! We'll be in touch shortly." },
  booking_name_ph: { da: "Dit fulde navn", en: "Your full name" },
  booking_email_ph: { da: "din@email.dk", en: "your@email.com" },
  booking_note_ph: { da: "Allergier, jubilæum, andet...", en: "Allergies, anniversary, other..." },

  // Chat
  chat_title: { da: "Spørg Birk", en: "Ask Birk" },
  chat_subtitle: { da: "Vores AI-assistent hjælper dig", en: "Our AI assistant helps you" },
  chat_placeholder: { da: "Skriv en besked...", en: "Type a message..." },
  chat_welcome: { da: "Hej! Jeg er Birks assistent. Jeg kan hjælpe dig med reservation, menuinformation og meget mere. Hvad kan jeg gøre for dig?", en: "Hello! I'm Birk's assistant. I can help you with reservations, menu information and much more. How can I help you?" },

  // Footer
  footer_address: { da: "Skovvej 14, 2100 København Ø", en: "Skovvej 14, 2100 Copenhagen" },
  footer_hours: { da: "Tirsdag–Lørdag: 18:00–22:30", en: "Tuesday–Saturday: 6:00 PM–10:30 PM" },
  footer_rights: { da: "Alle rettigheder forbeholdes", en: "All rights reserved" },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "da",
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>("da");
  const t = (key: string) => translations[key]?.[lang] ?? key;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
