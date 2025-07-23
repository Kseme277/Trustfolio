// Fichier : prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Début du seeding...`);

  // Pour éviter les erreurs de clés étrangères, il est préférable de supprimer 
  // les enregistrements dans un ordre qui respecte les relations.
  // Ici, on supprime d'abord les commandes, puis les livres et les valeurs.
  await prisma.personalizedOrder.deleteMany();
  await prisma.book.deleteMany();
  await prisma.value.deleteMany();
  
  console.log('Anciennes données nettoyées.');

  // --- Création de la liste étendue de valeurs ---
  console.log('Création des valeurs...');
  const valuesToCreate = [
    // Valeurs de Caractère & Éthique
    { name: 'Courage' }, { name: 'Honnêteté' }, { name: 'Respect' }, 
    { name: 'Responsabilité' }, { name: 'Générosité' }, { name: 'Patience' },
    { name: 'Persévérance' }, { name: 'Empathie' }, { name: 'Gentillesse' },
    { name: 'Intégrité' }, { name: 'Gratitude' }, { name: 'Humilité' },
    
    // Valeurs Sociales & Familiales
    { name: 'Amour de la famille' }, { name: 'Amitié' }, { name: 'Partage' },
    { name: 'Solidarité' }, { name: 'Écoute' }, { name: 'Tolérance' },
    { name: 'Tradition' }, { name: 'Communauté' },
    
    // Valeurs Intellectuelles & Créatives
    { name: 'Créativité' }, { name: 'Curiosité' }, { name: 'Apprentissage' },
    { name: 'Imagination' }, { name: 'Sagesse' }, { name: 'Innovation' },

    // Valeurs d'Action & de Développement Personnel
    { name: 'Confiance en soi' }, { name: 'Initiative' }, { name: 'Optimisme' },
    { name: 'Discipline' }, { name: 'Leadership' }, { name: 'Ambition' },
    { name: 'Entrepreneuriat' }, { name: 'Écologie' },
  ];

  // On utilise createMany pour insérer toutes les valeurs en une seule requête, c'est plus efficace.
  await prisma.value.createMany({
    data: valuesToCreate,
    skipDuplicates: true, // Important pour ne pas échouer si on relance le script
  });
  console.log(`${valuesToCreate.length} valeurs ont été créées.`);


  // --- Création des livres réels avec PDF ---
  console.log('Création des vrais livres avec PDF...');
  await prisma.book.create({
    data: {
      title: "L'épopée loufoque de Mamie Gertrude",
      description: "Une aventure hilarante où Mamie Gertrude, armée de son parapluie magique, sauve son village d'une invasion de canards géants.",
      shortDescription: "Mamie Gertrude et les canards géants",
      coverImage: "/Livre.jpeg",
      price: 12000,
      tags: ["Humour", "Aventure", "Famille"],
      pdfUrl: "/pdf/_l_epopee_loufoque_de_mamie_gertrude__optimized.pdf"
    }
  });
  await prisma.book.create({
    data: {
      title: "Grady Bear",
      description: "Grady Bear part à la découverte de la forêt et apprend la valeur de l'amitié et du courage face à l'inconnu.",
      shortDescription: "L'ours Grady et la forêt enchantée",
      coverImage: "/Livre.jpeg",
      price: 15000,
      tags: ["Animaux", "Amitié", "Courage"],
      pdfUrl: "/pdf/Grady_Bear.pdf"
    }
  });
  await prisma.book.create({
    data: {
      title: "Amazing Me!",
      description: "Un livre inspirant pour aider les enfants à découvrir leur potentiel et à s'aimer tels qu'ils sont.",
      shortDescription: "Découvre le meilleur de toi-même !",
      coverImage: "/Livre.jpeg",
      price: 18000,
      tags: ["Développement personnel", "Confiance en soi", "Enfants"],
      pdfUrl: "/pdf/amazing_me_final_version_508.pdf"
    }
  });
  console.log('Vrais livres insérés avec PDF.');

  console.log(`\nSeeding terminé avec succès !`);
}

main()
  .catch((e) => {
    console.error("Une erreur est survenue pendant le seeding :");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // On s'assure de fermer la connexion à la base de données
    await prisma.$disconnect();
  });