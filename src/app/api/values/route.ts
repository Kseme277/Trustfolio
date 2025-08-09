// src/app/api/values/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { values } from '../../../db/schema';

export async function GET() {
  try {
    const valuesResult = await db.select().from(values);
    
    // Dictionnaire de traductions pour chaque valeur
    const translations: Record<string, { en: string; de: string; es: string; ar: string }> = {
      'Courage': { en: 'Courage', de: 'Mut', es: 'Valentía', ar: 'شجاعة' },
      'Honnêteté': { en: 'Honesty', de: 'Ehrlichkeit', es: 'Honestidad', ar: 'أمانة' },
      'Respect': { en: 'Respect', de: 'Respekt', es: 'Respeto', ar: 'احترام' },
      'Responsabilité': { en: 'Responsibility', de: 'Verantwortung', es: 'Responsabilidad', ar: 'مسؤولية' },
      'Générosité': { en: 'Generosity', de: 'Großzügigkeit', es: 'Generosidad', ar: 'كرم' },
      'Patience': { en: 'Patience', de: 'Geduld', es: 'Paciencia', ar: 'صبر' },
      'Créativité': { en: 'Creativity', de: 'Kreativität', es: 'Creatividad', ar: 'إبداع' },
      'Solidarité': { en: 'Solidarity', de: 'Solidarität', es: 'Solidaridad', ar: 'تضامن' },
      'Empathie': { en: 'Empathy', de: 'Empathie', es: 'Empatía', ar: 'تعاطف' },
      'Détermination': { en: 'Determination', de: 'Entschlossenheit', es: 'Determinación', ar: 'تصميم' },
      'Persévérance': { en: 'Perseverance', de: 'Ausdauer', es: 'Perseverancia', ar: 'مثابرة' },
      'Gentillesse': { en: 'Kindness', de: 'Freundlichkeit', es: 'Amabilidad', ar: 'لطف' },
      'Partage': { en: 'Sharing', de: 'Teilen', es: 'Compartir', ar: 'مشاركة' },
      'Famille': { en: 'Family', de: 'Familie', es: 'Familia', ar: 'عائلة' },
      'Aventure': { en: 'Adventure', de: 'Abenteuer', es: 'Aventura', ar: 'مغامرة' },
      'Inspiration': { en: 'Inspiration', de: 'Inspiration', es: 'Inspiración', ar: 'إلهام' },
      'Éducation': { en: 'Education', de: 'Bildung', es: 'Educación', ar: 'تعليم' },
      'Humour': { en: 'Humor', de: 'Humor', es: 'Humor', ar: 'فكاهة' },
      'Animaux': { en: 'Animals', de: 'Tiere', es: 'Animales', ar: 'حيوانات' },
      'Découverte': { en: 'Discovery', de: 'Entdeckung', es: 'Descubrimiento', ar: 'اكتشاف' },
      'Nature': { en: 'Nature', de: 'Natur', es: 'Naturaleza', ar: 'طبيعة' },
      'Légende': { en: 'Legend', de: 'Legende', es: 'Leyenda', ar: 'أسطورة' },
      'Tradition': { en: 'Tradition', de: 'Tradition', es: 'Tradición', ar: 'تقليد' },
      'Culture': { en: 'Culture', de: 'Kultur', es: 'Cultura', ar: 'ثقافة' },
      'Transmission': { en: 'Heritage', de: 'Weitergabe', es: 'Herencia', ar: 'إرث' },
      // Ajout de nouvelles valeurs avec traductions correctes
      'Amour': { en: 'Love', de: 'Liebe', es: 'Amor', ar: 'حب' },
      'Confiance': { en: 'Trust', de: 'Vertrauen', es: 'Confianza', ar: 'ثقة' },
      'Gratitude': { en: 'Gratitude', de: 'Dankbarkeit', es: 'Gratitud', ar: 'امتنان' },
      'Humilité': { en: 'Humility', de: 'Demut', es: 'Humildad', ar: 'تواضع' },
      'Justice': { en: 'Justice', de: 'Gerechtigkeit', es: 'Justicia', ar: 'عدالة' },
      'Liberté': { en: 'Freedom', de: 'Freiheit', es: 'Libertad', ar: 'حرية' },
      'Paix': { en: 'Peace', de: 'Frieden', es: 'Paz', ar: 'سلام' },
      'Sagesse': { en: 'Wisdom', de: 'Weisheit', es: 'Sabiduría', ar: 'حكمة' },
      'Tolérance': { en: 'Tolerance', de: 'Toleranz', es: 'Tolerancia', ar: 'تسامح' },
      'Unité': { en: 'Unity', de: 'Einheit', es: 'Unidad', ar: 'وحدة' },
      'Bienveillance': { en: 'Kindness', de: 'Güte', es: 'Benevolencia', ar: 'لطف' },
      'Curiosité': { en: 'Curiosity', de: 'Neugier', es: 'Curiosidad', ar: 'فضول' },
      'Dévouement': { en: 'Dedication', de: 'Hingabe', es: 'Dedicación', ar: 'تفاني' },
      'Excellence': { en: 'Excellence', de: 'Exzellenz', es: 'Excelencia', ar: 'تميز' },
      'Fidélité': { en: 'Loyalty', de: 'Treue', es: 'Lealtad', ar: 'وفاء' },
      'Harmonie': { en: 'Harmony', de: 'Harmonie', es: 'Armonía', ar: 'تناغم' },
      'Intégrité': { en: 'Integrity', de: 'Integrität', es: 'Integridad', ar: 'نزاهة' },
      'Joie': { en: 'Joy', de: 'Freude', es: 'Alegría', ar: 'فرح' },
      'Modestie': { en: 'Modesty', de: 'Bescheidenheit', es: 'Modestia', ar: 'بساطة' },
      'Optimisme': { en: 'Optimism', de: 'Optimismus', es: 'Optimismo', ar: 'تفاؤل' },
      'Prudence': { en: 'Prudence', de: 'Vorsicht', es: 'Prudencia', ar: 'حذر' },
      'Respect de soi': { en: 'Self-respect', de: 'Selbstachtung', es: 'Auto-respeto', ar: 'احترام الذات' },
      'Sensibilité': { en: 'Sensitivity', de: 'Empfindsamkeit', es: 'Sensibilidad', ar: 'حساسية' },
      'Simplicité': { en: 'Simplicity', de: 'Einfachheit', es: 'Simplicidad', ar: 'سهولة' },
      'Sincérité': { en: 'Sincerity', de: 'Aufrichtigkeit', es: 'Sinceridad', ar: 'صدق' },
      'Ténacité': { en: 'Tenacity', de: 'Zähigkeit', es: 'Tenacidad', ar: 'عناد' },
      'Vérité': { en: 'Truth', de: 'Wahrheit', es: 'Verdad', ar: 'حقيقة' },
      'Volonté': { en: 'Willpower', de: 'Willenskraft', es: 'Voluntad', ar: 'إرادة' }
    };
    
    // Transformer les données pour correspondre au format attendu par le composant
    const transformedValues = valuesResult.map(value => {
      const frenchName = (value as any).name_fr || '';
      const translation = translations[frenchName] || { en: frenchName, de: frenchName, es: frenchName, ar: frenchName };
      
      return {
        id: value.id,
        name_fr: frenchName,
        name_en: translation.en,
        name_de: translation.de,
        name_es: translation.es,
        name_ar: translation.ar
      };
    });
    
    return NextResponse.json(transformedValues);
  } catch (error) {
    console.error('API /api/values - Erreur:', error);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}