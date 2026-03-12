import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FormData {
  name: string;
  email: string;
  phone: string;
  guests: string;
  note: string;
}

// Only date: February 25, 2026
const BOOKING_DATE = new Date(2026, 1, 25);
const BOOKING_TIME = "18:30";

export default function BookingSection() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", guests: "1", note: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const update = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const inputClass =
    "w-full font-body text-sm bg-background border border-border px-4 py-3 text-foreground placeholder:text-stone focus:outline-none focus:border-foreground transition-colors";
  const labelClass = "font-body text-xs tracking-widest-plus text-stone uppercase block mb-1.5";

  return (
    <section id="booking" className="py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-body text-xs tracking-widest-plus text-stone uppercase mb-4">
            {t("booking_tag")}
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-5">
            {t("booking_title")}
          </h2>
          <p className="font-body text-base text-stone">
            {t("booking_subtitle")}
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-16 bg-sand">
            <div className="inline-flex items-center justify-center w-12 h-12 border border-birch mb-6">
              <Check className="text-birch" size={20} />
            </div>
            <p className="font-display text-2xl text-foreground">{t("booking_success")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("booking_name")}</label>
                <input
                  required
                  type="text"
                  className={inputClass}
                  placeholder={t("booking_name_ph")}
                  value={form.name}
                  onChange={update("name")}
                />
              </div>
              <div>
                <label className={labelClass}>{t("booking_phone")}</label>
                <input
                  required
                  type="tel"
                  className={inputClass}
                  placeholder="+45 00 00 00 00"
                  value={form.phone}
                  onChange={update("phone")}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("booking_email")}</label>
              <input
                required
                type="email"
                className={inputClass}
                placeholder={t("booking_email_ph")}
                value={form.email}
                onChange={update("email")}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Date picker — only Feb 25, 2026 selectable */}
              <div className="col-span-2">
                <label className={labelClass}>{t("booking_date")}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        inputClass,
                        "flex items-center justify-between cursor-pointer"
                      )}
                    >
                      <span className={BOOKING_DATE ? "text-foreground" : "text-stone"}>
                        {format(BOOKING_DATE, "dd. MMMM yyyy")}
                      </span>
                      <CalendarIcon size={15} className="text-stone shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={BOOKING_DATE}
                      defaultMonth={BOOKING_DATE}
                      disabled={(date) =>
                        date.toDateString() !== BOOKING_DATE.toDateString()
                      }
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Guests: 1–2 */}
              <div>
                <label className={labelClass}>{t("booking_guests")}</label>
                <select
                  required
                  className={inputClass}
                  value={form.guests}
                  onChange={update("guests")}
                >
                  {[1, 2].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Single time slot */}
            <div>
              <label className={labelClass}>{t("booking_time")}</label>
              <div className="flex gap-2">
                <div className="font-body text-sm py-2.5 px-6 border border-foreground bg-foreground text-background">
                  {BOOKING_TIME}
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("booking_note")}</label>
              <textarea
                rows={3}
                className={inputClass + " resize-none"}
                placeholder={t("booking_note_ph")}
                value={form.note}
                onChange={update("note")}
              />
            </div>

            <button
              type="submit"
              className="w-full font-body text-sm tracking-widest-plus uppercase py-4 bg-primary text-primary-foreground hover:bg-birch/90 transition-colors"
            >
              {t("booking_submit")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
