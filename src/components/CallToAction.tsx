// src/components/CallToAction.tsx
import Link from 'next/link';
export default function CallToAction() {
  return (
    <section className="w-full py-16">
      <div className="container mx-auto">
        <div className="bg-orange-500 text-white p-12 rounded-2xl text-center">
          <h2 className="text-4xl font-bold mb-4">Prêt à créer un livre unique pour votre enfant ?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">Offrez-lui une expérience de lecture personnalisée qui célèbre son identité et transmet des valeurs importantes.</p>
          <Link href="/livres" className="bg-white text-orange-500 font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
            Explorer nos livres
          </Link>
        </div>
      </div>
    </section>
  );
}