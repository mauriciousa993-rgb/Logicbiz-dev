const menu = ["Inicio", "Servicios", "Proyectos", "Contacto"];

export function Navbar() {
  return (
    <header className="section-shell sticky top-0 z-20 border-b border-white/10 bg-slate-950/65 backdrop-blur-md">
      <nav className="mx-auto flex w-full items-center justify-between py-4">
        <span className="text-xl font-semibold tracking-wide">LogicBiz Dev</span>
        <ul className="hidden items-center gap-6 md:flex">
          {menu.map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-foreground-soft transition hover:text-white"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
