// Fichier : src/app/a-propos/page.tsx
'use client'; // Client Component pour les animations et interactions

import Image from 'next/image';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll'; // Importe le composant d'animation
import ClientHeroCarousel from '@/components/ClientHeroCarousel';

export default function AboutPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      
      {/* Section Héro / Bannière "À Propos" */}
      <section className="container mx-auto px-6 py-16 text-center">
        <AnimateOnScroll>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            À Propos de TrustFolio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Découvrez notre mission de créer des livres personnalisés qui transforment les enfants en héros de leur propre histoire.
          </p>
        </AnimateOnScroll>
      </section>

      {/* Section "Notre Mission" */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll>
            <div className="md:order-1"> {/* Texte à gauche sur desktop */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Notre Mission</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                Chez <span className="font-bold text-orange-500">TrustFolio</span>, nous croyons que chaque enfant mérite de se voir représenté dans les histoires qu'il lit. Notre mission est de créer des livres personnalisés qui reflètent l'identité, la culture et les valeurs de chaque enfant.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Nous sommes convaincus que la représentation dans la littérature jeunesse est essentielle pour le développement de l'estime de soi et l'éveil culturel des enfants. C'est pourquoi nous nous engageons à créer des histoires où chaque enfant peut se reconnaître et s'identifier.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Notre approche unique combine personnalisation, valeurs éducatives et célébration de la diversité culturelle pour offrir une expérience de lecture enrichissante et significative.
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden shadow-lg md:order-2"> {/* Image à droite sur desktop */}
              <ClientHeroCarousel />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section "Notre Proposition" */}
      <section className="container mx-auto px-6 py-16 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
        <AnimateOnScroll>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Et si votre enfant devenait le héros d'une histoire qui lui ressemble ?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-3xl mx-auto mb-10">
            Chez nous, chaque livre est bien plus qu'un conte : c'est un outil d'éveil, de valorisation et d'apprentissage. Votre enfant y retrouve son prénom, sa culture... et des valeurs essentielles pour bien grandir.
          </p>
        </AnimateOnScroll>
        
        {/* Grille des propositions de valeur */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimateOnScroll delay={0.1}>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md text-center hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-orange-500 mb-4 mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Amour de la famille</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Comme Amina qui découvre que les liens du cœur sont les plus forts.</p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md text-center hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-orange-500 mb-4 mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><path d="M2.5 14.8V21h12.5V14.8"/><path d="M10 10.2L12.5 2h4.4L13 14.8"/><path d="M14.5 13.8L11 21h-4.4L10 10.2"/></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Esprit d'initiative</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Comme Kwadjeu qui transforme ses idées en aventures extraordinaires.</p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.3}>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md text-center hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-orange-500 mb-4 mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Entrepreneuriat</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Comme Fidel qui crée, partage, et agit pour les autres.</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section "Nos Livres Personnalisés" (Exemples Visuels) */}
      <section className="container mx-auto px-6 py-16">
        <AnimateOnScroll>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Nos Livres Personnalisés
          </h2>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimateOnScroll delay={0.1}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
              <div className="relative w-full h-64">
                <Image src="/trustfolio_logo.jpeg" alt="L'Aventure d'Amina" layout="fill" objectFit="cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">L'Aventure d'Amina</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Une histoire touchante où votre enfant découvre l'importance des liens familiaux à travers l'Amina.</p>
              </div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
              <div className="relative w-full h-64">
                <Image src="/Livre.jpeg" alt="Les Idées de Kwadjeu" layout="fill" objectFit="cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Les Idées de Kwadjeu</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Suivez Kwadjeu dans son parcours pour transformer ses idées en projets concrets qui inspirent les autres.</p>
              </div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.3}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
              <div className="relative w-full h-64">
                <Image src="/facture_livre.jpeg" alt="Le Projet de Fidel" layout="fill" objectFit="cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Le Projet de Fidel</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Découvrez comment Fidel utilise son esprit entrepreneurial pour créer quelque chose qui aide sa communauté.</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section "Notre Processus" */}
      <section className="container mx-auto px-6 py-16">
        <AnimateOnScroll>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Notre Processus
          </h2>
        </AnimateOnScroll>
        <div className="max-w-3xl mx-auto space-y-12">
          {[
            { num: 1, title: 'Personnalisation', desc: 'Vous choisissez le prénom de votre enfant, sa culture et les valeurs que vous souhaitez mettre en avant dans l\'histoire.' },
            { num: 2, title: 'Création', desc: 'Nos auteurs et illustrateurs créent une histoire unique où votre enfant devient le héros principal, entouré de personnages qui lui ressemblent et partagent sa culture.' },
            { num: 3, title: 'Production', desc: 'Nous produisons un livre de haute qualité, avec des illustrations vibrantes et un texte adapté à l\'âge de votre enfant.' },
            { num: 4, title: 'Livraison', desc: 'Votre livre personnalisé est livré directement chez vous, prêt à offrir à votre enfant une expérience de lecture unique et mémorable.' },
          ].map((item, index) => (
            <AnimateOnScroll key={item.num} delay={index * 0.1}>
              <div className="flex items-start space-x-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-orange-500 text-white text-2xl font-bold rounded-full">
                  {item.num}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Appel à l'action final (peut être réutilisé du composant CallToAction) */}
      <section className="w-full py-16">
        <AnimateOnScroll>
          <div className="container mx-auto">
            <div className="bg-orange-500 text-white p-12 rounded-2xl text-center shadow-lg">
              <h2 className="text-4xl font-bold mb-4">Offrez une Histoire Unique à Votre Enfant</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto">Découvrez notre collection de livres personnalisés et donnez à votre enfant l'opportunité de devenir le héros d'une histoire qui lui ressemble.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/livres" className="bg-white text-orange-500 font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
                  Explorer Nos Livres
                </Link>
                <Link href="/contact" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-orange-500 transition-colors">
                  Nous Contacter
                </Link>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

    </div>
  );
}