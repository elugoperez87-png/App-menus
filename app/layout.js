import './globals.css';
import Nav from '../components/Nav';

export const metadata = {
  title: 'El cuaderno de menús',
  description: 'Recetas de desayuno, comida y cena, y sugerencias según tu despensa.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="max-w-5xl mx-auto px-4 py-10 text-xs text-ink/40">
          Hecho para no volver a preguntarte qué cocinar hoy.
        </footer>
      </body>
    </html>
  );
}
