'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/mis-recetas', label: 'Mis recetas' },
  { href: '/descubrir', label: 'Descubrir' },
  { href: '/despensa', label: 'Despensa' },
  { href: '/perfil', label: 'Perfil' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16 overflow-x-auto">
        <Link href="/" className="font-display text-xl text-pine tracking-tight shrink-0 mr-4">
          El cuaderno de menús
        </Link>
        <nav className="flex gap-1 sm:gap-2 shrink-0">
          {links.map((link) => {
            const active =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-pine text-paper'
                    : 'text-ink/70 hover:text-ink hover:bg-ink/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
