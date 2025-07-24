// Fichier : prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.book.createMany({
    data: [
      {
        title: 'L’Aventure d’Amina',
        description: 'Une histoire touchante où votre enfant découvre l’importance des liens familiaux à travers Amina.',
        shortDescription: 'Découverte des liens familiaux',
        description_fr: 'Une histoire touchante où votre enfant découvre l’importance des liens familiaux à travers Amina.',
        description_en: 'A touching story where your child discovers the importance of family bonds through Amina.',
        description_de: 'Eine berührende Geschichte, in der Ihr Kind die Bedeutung familiärer Bindungen durch Amina entdeckt.',
        description_es: 'Una historia conmovedora donde su hijo descubre la importancia de los lazos familiares a través de Amina.',
        description_ar: 'قصة مؤثرة يكتشف فيها طفلك أهمية الروابط الأسرية من خلال أمينة.',
        shortDescription_fr: 'Découverte des liens familiaux',
        shortDescription_en: 'Discovering family bonds',
        shortDescription_de: 'Entdeckung familiärer Bindungen',
        shortDescription_es: 'Descubriendo los lazos familiares',
        shortDescription_ar: 'اكتشاف الروابط الأسرية',
        coverImage: '/ines-murielle.jpg',
        price: 12000,
        tags: ['famille', 'aventure'],
      },
      {
        title: 'Les Idées de Kwadjeu',
        description: 'Suivez Kwadjeu dans son parcours pour transformer ses idées en projets concrets qui inspirent les autres.',
        shortDescription: 'Inspiration et créativité',
        description_fr: 'Suivez Kwadjeu dans son parcours pour transformer ses idées en projets concrets qui inspirent les autres.',
        description_en: 'Follow Kwadjeu on his journey to turn his ideas into concrete projects that inspire others.',
        description_de: 'Folgen Sie Kwadjeu auf seinem Weg, seine Ideen in konkrete Projekte umzusetzen, die andere inspirieren.',
        description_es: 'Sigue a Kwadjeu en su viaje para convertir sus ideas en proyectos concretos que inspiran a otros.',
        description_ar: 'تابع كواجدو في رحلته لتحويل أفكاره إلى مشاريع ملموسة تلهم الآخرين.',
        shortDescription_fr: 'Inspiration et créativité',
        shortDescription_en: 'Inspiration and creativity',
        shortDescription_de: 'Inspiration und Kreativität',
        shortDescription_es: 'Inspiración y creatividad',
        shortDescription_ar: 'إلهام وإبداع',
        coverImage: '/1753102053692-Anya-Bond-PC.jpg',
        price: 10000,
        tags: ['créativité', 'inspiration'],
      },
      {
        title: 'Le Secret du Baobab',
        description: 'Un voyage initiatique au cœur de la savane africaine, entre légendes et découvertes.',
        shortDescription: 'Voyage initiatique et légendes',
        description_fr: 'Un voyage initiatique au cœur de la savane africaine, entre légendes et découvertes.',
        description_en: 'An initiatory journey in the heart of the African savannah, between legends and discoveries.',
        description_de: 'Eine initiatische Reise im Herzen der afrikanischen Savanne, zwischen Legenden und Entdeckungen.',
        description_es: 'Un viaje iniciático en el corazón de la sabana africana, entre leyendas y descubrimientos.',
        description_ar: 'رحلة استكشافية في قلب السافانا الأفريقية، بين الأساطير والاكتشافات.',
        shortDescription_fr: 'Voyage initiatique et légendes',
        shortDescription_en: 'Initiatory journey and legends',
        shortDescription_de: 'Initiatische Reise und Legenden',
        shortDescription_es: 'Viaje iniciático y leyendas',
        shortDescription_ar: 'رحلة استكشافية وأساطير',
        coverImage: '/1753102238249-game_one_piece_pirate_hat_wallpaper_6bb11c3fe04958d81ee2ca7e58bf.jpg',
        price: 15000,
        tags: ['nature', 'légende'],
      },
      {
        title: 'Contes pour des enfants pas très sages',
        description: 'Des histoires drôles et éducatives pour apprendre en s’amusant.',
        shortDescription: 'Histoires drôles et éducatives',
        description_fr: 'Des histoires drôles et éducatives pour apprendre en s’amusant.',
        description_en: 'Funny and educational stories to learn while having fun.',
        description_de: 'Lustige und lehrreiche Geschichten zum Lernen mit Spaß.',
        description_es: 'Historias divertidas y educativas para aprender divirtiéndose.',
        description_ar: 'قصص مضحكة وتعليمية للتعلم أثناء الاستمتاع.',
        shortDescription_fr: 'Histoires drôles et éducatives',
        shortDescription_en: 'Funny and educational stories',
        shortDescription_de: 'Lustige und lehrreiche Geschichten',
        shortDescription_es: 'Historias divertidas y educativas',
        shortDescription_ar: 'قصص مضحكة وتعليمية',
        coverImage: '/contes-africains.webp',
        price: 9000,
        tags: ['éducation', 'humour'],
      },
      {
        title: 'Grady Bear',
        description: 'L’ours Grady part à la découverte de l’Afrique et de ses merveilles.',
        shortDescription: 'Découverte de l’Afrique',
        description_fr: 'L’ours Grady part à la découverte de l’Afrique et de ses merveilles.',
        description_en: 'Grady the bear sets out to discover Africa and its wonders.',
        description_de: 'Der Bär Grady macht sich auf, Afrika und seine Wunder zu entdecken.',
        description_es: 'El oso Grady parte a descubrir África y sus maravillas.',
        description_ar: 'الدب جرادي ينطلق لاكتشاف أفريقيا وعجائبها.',
        shortDescription_fr: 'Découverte de l’Afrique',
        shortDescription_en: 'Discovering Africa',
        shortDescription_de: 'Afrika entdecken',
        shortDescription_es: 'Descubriendo África',
        shortDescription_ar: 'اكتشاف أفريقيا',
        coverImage: '/Grady-bear-online-picture-book.webp',
        price: 11000,
        tags: ['animaux', 'découverte'],
      },
    ],
    skipDuplicates: true,
  });
  console.log('Livres de test ajoutés !');
}

async function insertInitialValues() {
  const baseValues = [
    'Courage', 'Honnêteté', 'Respect', 'Responsabilité', 'Générosité',
    'Patience', 'Créativité', 'Solidarité', 'Empathie', 'Détermination',
    'Persévérance', 'Gentillesse', 'Partage', 'Famille', 'Aventure',
    'Inspiration', 'Éducation', 'Humour', 'Animaux', 'Découverte',
    'Nature', 'Légende', 'Tradition', 'Culture', 'Transmission',
  ];
  for (const name_fr of baseValues) {
    await prisma.value.create({ data: { name_fr } });
  }
  console.log('Valeurs de base insérées !');
}

async function migrateValuesToMultilang() {
  const translations: Record<string, Record<string, string>> = {
    'Courage': { en: 'Courage', de: 'Mut', es: 'Coraje', ar: 'الشجاعة' },
    'Honnêteté': { en: 'Honesty', de: 'Ehrlichkeit', es: 'Honestidad', ar: 'الأمانة' },
    'Respect': { en: 'Respect', de: 'Respekt', es: 'Respeto', ar: 'الاحترام' },
    'Responsabilité': { en: 'Responsibility', de: 'Verantwortung', es: 'Responsabilidad', ar: 'المسؤولية' },
    'Générosité': { en: 'Generosity', de: 'Großzügigkeit', es: 'Generosidad', ar: 'الكرم' },
    'Patience': { en: 'Patience', de: 'Geduld', es: 'Paciencia', ar: 'الصبر' },
    'Créativité': { en: 'Creativity', de: 'Kreativität', es: 'Creatividad', ar: 'الإبداع' },
    'Solidarité': { en: 'Solidarity', de: 'Solidarität', es: 'Solidaridad', ar: 'التضامن' },
    'Empathie': { en: 'Empathy', de: 'Empathie', es: 'Empatía', ar: 'التعاطف' },
    'Détermination': { en: 'Determination', de: 'Entschlossenheit', es: 'Determinación', ar: 'العزيمة' },
    'Persévérance': { en: 'Perseverance', de: 'Durchhaltevermögen', es: 'Perseverancia', ar: 'المثابرة' },
    'Gentillesse': { en: 'Kindness', de: 'Freundlichkeit', es: 'Amabilidad', ar: 'اللطف' },
    'Partage': { en: 'Sharing', de: 'Teilen', es: 'Compartir', ar: 'المشاركة' },
    'Famille': { en: 'Family', de: 'Familie', es: 'Familia', ar: 'العائلة' },
    'Aventure': { en: 'Adventure', de: 'Abenteuer', es: 'Aventura', ar: 'المغامرة' },
    'Inspiration': { en: 'Inspiration', de: 'Inspiration', es: 'Inspiración', ar: 'الإلهام' },
    'Éducation': { en: 'Education', de: 'Bildung', es: 'Educación', ar: 'التعليم' },
    'Humour': { en: 'Humor', de: 'Humor', es: 'Humor', ar: 'الفكاهة' },
    'Animaux': { en: 'Animals', de: 'Tiere', es: 'Animales', ar: 'الحيوانات' },
    'Découverte': { en: 'Discovery', de: 'Entdeckung', es: 'Descubrimiento', ar: 'الاكتشاف' },
    'Nature': { en: 'Nature', de: 'Natur', es: 'Naturaleza', ar: 'الطبيعة' },
    'Légende': { en: 'Legend', de: 'Legende', es: 'Leyenda', ar: 'أسطورة' },
    'Tradition': { en: 'Tradition', de: 'Tradition', es: 'Tradición', ar: 'تقاليد' },
    'Culture': { en: 'Culture', de: 'Kultur', es: 'Cultura', ar: 'الثقافة' },
    'Transmission': { en: 'Transmission', de: 'Übertragung', es: 'Transmisión', ar: 'النقل' },
    // Ajoute d'autres valeurs ici si besoin
  };
  const values = await prisma.value.findMany();
  for (const v of values) {
    const fr = v.name_fr || '';
    const t = translations[fr] || { en: fr, de: fr, es: fr, ar: fr };
    await prisma.value.update({
      where: { id: v.id },
      data: {
        name_fr: fr,
        name_en: t.en,
        name_de: t.de,
        name_es: t.es,
        name_ar: t.ar,
      },
    });
  }
  console.log('Valeurs multilingues migrées !');
}

main()
  .then(insertInitialValues)
  .then(migrateValuesToMultilang)
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });