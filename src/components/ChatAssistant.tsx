import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Send, Loader2, MessageCircle } from "lucide-react";
import starsIcon from "@/assets/stars.svg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/birk-chat`;

// Star avatar using the provided SVG, tinted grey
function StarAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-foreground flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src={starsIcon}
        alt="Birk AI"
        style={{
          width: size * 0.55,
          height: size * 0.55,
          filter: "invert(1) brightness(0.7)",
        }}
      />
    </div>
  );
}

export default function ChatAssistant() {
  const { t, lang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const welcomeMsg = t("chat_welcome");

  // Appear after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMessages([{ role: "assistant", content: welcomeMsg }]);
  }, [lang]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleOpen = () => {
    setClosing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 280);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages, lang }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Fejl" }));
        throw new Error(err.error || "Stream fejl");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantSoFar = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.content !== welcomeMsg) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Der opstod en fejl";
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button — appears after 3s with smooth animation */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        } ${open ? "opacity-0 scale-90 pointer-events-none" : ""}`}
      >
        <button
          onClick={handleOpen}
          className="w-14 h-14 bg-foreground text-background flex items-center justify-center shadow-card hover:bg-stone transition-all duration-200 rounded-full"
          aria-label="Open chat"
        >
          <MessageCircle size={22} />
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 flex flex-col bg-background border border-border shadow-card rounded-2xl overflow-hidden ${
            closing ? "animate-chat-slide-down" : "animate-chat-slide-up"
          }`}
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-sand shrink-0">
            <div className="flex items-center gap-3">
              <StarAvatar size={32} />
              <div>
                <p className="font-display text-sm text-foreground font-bold">{t("chat_title")}</p>
                <p className="font-body text-xs text-stone">{t("chat_subtitle")}</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-stone hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && <StarAvatar size={24} />}
                <div
                  className={`max-w-[78%] font-body text-sm leading-relaxed px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-foreground text-background rounded-t-2xl rounded-bl-2xl rounded-br-md"
                      : "bg-muted text-foreground border border-border rounded-t-2xl rounded-br-2xl rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <StarAvatar size={24} />
                <div className="bg-muted border border-border px-4 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md">
                  <Loader2 size={16} className="text-stone animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border flex items-center px-4 py-3 gap-3 shrink-0 bg-background">
            <input
              className="flex-1 font-body text-sm bg-transparent outline-none placeholder:text-stone text-foreground"
              placeholder={t("chat_placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="text-foreground disabled:text-stone transition-colors hover:text-stone"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
