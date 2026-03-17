export function Footer() {
  return (
    <footer className="section-shell border-t border-white/10 py-8 text-sm text-foreground-soft">
      <div className="flex flex-col justify-between gap-3 md:flex-row">
        <p>© {new Date().getFullYear()} LogicBiz Dev. Desarrollos web con impacto.</p>
        <p>Hecho con Next.js, Node.js y MongoDB.</p>
      </div>
    </footer>
  );
}
