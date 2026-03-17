"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const whatsappNumber = "573001112223";

const schema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 letras"),
  email: z.string().email("Email inválido"),
  message: z
    .string()
    .min(10, "Describe tu necesidad con al menos 10 caracteres")
    .max(800, "El mensaje es muy largo"),
});

type ContactValues = z.infer<typeof schema>;

export function ContactSection() {
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async (values: ContactValues) => {
    const message = `Hola, quiero que me ayudes con un proyecto.\n\nNombre: ${values.name}\nEmail: ${values.email}\nMensaje: ${values.message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
    setIsSent(true);
    reset();
  };

  return (
    <section
      id="contacto"
      className="section-shell rounded-3xl border border-indigo-300/20 bg-slate-900/70 px-6 py-12"
    >
      <h2 className="text-3xl font-semibold">Trabajemos juntos</h2>
      <p className="mt-2 text-sm text-foreground-soft">
        Déjame tu objetivo y te respondo con una propuesta clara y cronograma
        inicial.
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid gap-4 md:grid-cols-2"
        noValidate
      >
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Nombre
          </label>
          <input
            id="name"
            {...register("name")}
            type="text"
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 outline-none ring-offset-2 transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300/30"
            placeholder="Tu nombre"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-rose-300">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            {...register("email")}
            type="email"
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 outline-none ring-offset-2 transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300/30"
            placeholder="tucorreo@empresa.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-rose-300">{errors.email.message}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="message" className="mb-1 block text-sm font-medium">
            Mensaje
          </label>
          <textarea
            id="message"
            {...register("message")}
            rows={5}
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 outline-none ring-offset-2 transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300/30"
            placeholder="Describe tipo de aplicación, plazo y presupuesto estimado"
          />
          {errors.message && (
            <p className="mt-1 text-sm text-rose-300">
              {errors.message.message}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-800"
          >
            {isSubmitting ? "Enviando..." : "Enviar consulta"}
          </button>
        </div>
      </form>
      {isSent && (
        <p className="mt-4 text-sm text-emerald-300">
          Tu mensaje fue recibido. Te contactaré pronto.
        </p>
      )}
    </section>
  );
}
