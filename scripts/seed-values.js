const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const values = [
  { name_fr: 'Courage', name_en: 'Courage', name_de: 'Mut', name_es: 'Valentía', name_ar: 'شجاعة' },
  { name_fr: 'Honnêteté', name_en: 'Honesty', name_de: 'Ehrlichkeit', name_es: 'Honestidad', name_ar: 'أمانة' },
  { name_fr: 'Respect', name_en: 'Respect', name_de: 'Respekt', name_es: 'Respeto', name_ar: 'احترام' },
  { name_fr: 'Responsabilité', name_en: 'Responsibility', name_de: 'Verantwortung', name_es: 'Responsabilidad', name_ar: 'مسؤولية' },
  { name_fr: 'Générosité', name_en: 'Generosity', name_de: 'Großzügigkeit', name_es: 'Generosidad', name_ar: 'كرم' },
  { name_fr: 'Patience', name_en: 'Patience', name_de: 'Geduld', name_es: 'Paciencia', name_ar: 'صبر' },
  { name_fr: 'Créativité', name_en: 'Creativity', name_de: 'Kreativität', name_es: 'Creatividad', name_ar: 'إبداع' },
  { name_fr: 'Solidarité', name_en: 'Solidarity', name_de: 'Solidarität', name_es: 'Solidaridad', name_ar: 'تضامن' },
  { name_fr: 'Empathie', name_en: 'Empathy', name_de: 'Empathie', name_es: 'Empatía', name_ar: 'تعاطف' },
  { name_fr: 'Détermination', name_en: 'Determination', name_de: 'Entschlossenheit', name_es: 'Determinación', name_ar: 'تصميم' },
  { name_fr: 'Persévérance', name_en: 'Perseverance', name_de: 'Ausdauer', name_es: 'Perseverancia', name_ar: 'مثابرة' },
  { name_fr: 'Gentillesse', name_en: 'Kindness', name_de: 'Freundlichkeit', name_es: 'Amabilidad', name_ar: 'لطف' },
  { name_fr: 'Partage', name_en: 'Sharing', name_de: 'Teilen', name_es: 'Compartir', name_ar: 'مشاركة' },
  { name_fr: 'Famille', name_en: 'Family', name_de: 'Familie', name_es: 'Familia', name_ar: 'عائلة' },
  { name_fr: 'Aventure', name_en: 'Adventure', name_de: 'Abenteuer', name_es: 'Aventura', name_ar: 'مغامرة' },
  { name_fr: 'Inspiration', name_en: 'Inspiration', name_de: 'Inspiration', name_es: 'Inspiración', name_ar: 'إلهام' },
  { name_fr: 'Éducation', name_en: 'Education', name_de: 'Bildung', name_es: 'Educación', name_ar: 'تعليم' },
  { name_fr: 'Humour', name_en: 'Humor', name_de: 'Humor', name_es: 'Humor', name_ar: 'فكاهة' },
  { name_fr: 'Animaux', name_en: 'Animals', name_de: 'Tiere', name_es: 'Animales', name_ar: 'حيوانات' },
  { name_fr: 'Découverte', name_en: 'Discovery', name_de: 'Entdeckung', name_es: 'Descubrimiento', name_ar: 'اكتشاف' },
  { name_fr: 'Nature', name_en: 'Nature', name_de: 'Natur', name_es: 'Naturaleza', name_ar: 'طبيعة' },
  { name_fr: 'Légende', name_en: 'Legend', name_de: 'Legende', name_es: 'Leyenda', name_ar: 'أسطورة' },
  { name_fr: 'Tradition', name_en: 'Tradition', name_de: 'Tradition', name_es: 'Tradición', name_ar: 'تقليد' },
  { name_fr: 'Culture', name_en: 'Culture', name_de: 'Kultur', name_es: 'Cultura', name_ar: 'ثقافة' },
  { name_fr: 'Transmission', name_en: 'Transmission', name_de: 'Übertragung', name_es: 'Transmisión', name_ar: 'نقل' },
];

async function seedValues() {
  try {
    console.log('Début du seeding des valeurs...');
    
    // Vérifier s'il y a déjà des valeurs
    const existingValues = await prisma.value.findMany();
    console.log(`Nombre de valeurs existantes: ${existingValues.length}`);
    
    if (existingValues.length === 0) {
      console.log('Insertion des nouvelles valeurs...');
      for (const value of values) {
        await prisma.value.create({
          data: value
        });
      }
      console.log(`${values.length} valeurs insérées avec succès!`);
    } else {
      console.log('Des valeurs existent déjà, pas d\'insertion nécessaire.');
    }
    
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedValues(); 