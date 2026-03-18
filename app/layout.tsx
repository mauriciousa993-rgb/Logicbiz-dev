import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "LogicBiz Dev | Ingenieria de software y desarrollo web",
    template: "%s | LogicBiz Dev",
  },
  description:
    "Portafolio de LogicBiz Dev. Ingeniero de software full stack: desarrollo aplicaciones web modernas, APIs y sistemas a medida con foco en rendimiento y calidad.",
  openGraph: {
    title: "LogicBiz Dev | Ingenieria de software y desarrollo web",
    description:
      "Portafolio profesional de ingenieria de software: servicios full stack, proyectos reales y contacto directo.",
    url: "https://logicbiz.dev",
    siteName: "LogicBiz Dev",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
