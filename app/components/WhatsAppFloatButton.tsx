import { MessageCircle } from "lucide-react";

export function WhatsAppFloatButton() {
  const phone = "573001112223";
  const text = encodeURIComponent(
    "Hola, vi tu portafolio LogicBiz Dev y quiero pedir información para un proyecto."
  );
  const href = `https://wa.me/${phone}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-900/30 transition hover:scale-105 hover:bg-green-400"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <MessageCircle size={22} />
    </a>
  );
}
