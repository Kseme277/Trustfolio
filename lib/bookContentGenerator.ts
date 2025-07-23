// Fichier : src/lib/bookContentGenerator.ts

import { Order } from '@/types/app.d'; // Importe le type Order

/**
 * Génère un contenu de livre fictif basé sur les personnalisations de la commande.
 * Chaque élément du tableau est une "page" ou une section du livre.
 */
export function generateBookContent(order: Order): string[] {
  if (!order || !order.book) {
    return ["<h1 style='text-align:center;'>Contenu non disponible</h1><p style='text-align:center;'>Veuillez vérifier la commande.</p>"];
  }

  // Destructure toutes les propriétés potentiellement utilisées
  const { 
    book, 
    childName, 
    childPhotoUrl, 
    selectedValues, 
    heroAgeRange, 
    mainTheme, 
    storyLocation, 
    characters, 
    messageSpecial,
    city // NOUVEAU : Récupère la ville pour l'histoire
  } = order;

  const content: string[] = [];

  // --- Page de Titre / Introduction ---
  content.push(`
    <h1 style='text-align: center; font-size: 2.5em; margin-bottom: 20px; color: #ff5722;'>${book.title}</h1>
    <p style='text-align: center; font-style: italic; font-size: 1.2em;'>Une aventure magique pour notre cher(e) ${childName}</p>
    ${childPhotoUrl ? `<p style='text-align: center; margin-top: 20px;'><img src='${childPhotoUrl}' alt='Photo de ${childName}' style='width:180px; height:180px; border-radius:50%; object-fit:cover; border: 4px solid #ff9800;'></p>` : ''}
    <p style='text-align: center; margin-top: 30px; font-size: 0.9em; color: #757575;'>Illustré avec amour par l'équipe TrustFolio</p>
  `);

  // --- Page 2 : Le Début de l'Aventure ---
  content.push(`
    <h2 style='font-size: 1.8em; margin-top: 40px; color: #ff5722;'>Le Réveil de l'Aventure</h2>
    <p style='text-indent: 2em;'>Au cœur du majestueux ${storyLocation || 'd\'une forêt enchantée'}, vivait un(e) jeune explorateur(trice) appelé(e) ${childName}, ${heroAgeRange ? `âgé(e) de ${heroAgeRange}` : 'plein(e) de curiosité'}. Chaque matin, le soleil filtrait à travers les feuilles, illuminant le chemin vers de nouvelles découvertes. ${childName} rêvait de ${mainTheme ? mainTheme.toLowerCase() : 'grandes aventures'}, et aujourd'hui, ce rêve allait commencer.</p>
    <p style='text-indent: 2em;'>Un ancien rouleau, trouvé sous les racines d'un baobab millénaire, révélait une quête secrète. Pour le réussir, ${childName} devrait faire preuve de ${selectedValues[0]?.name || 'courage'} et de ${selectedValues[1]?.name || 'détermination'}.</p>
  `);

  // --- Page 3 : Les Compagnons et les Valeurs ---
  if (characters && characters.length > 0) {
    content.push(`
      <h2 style='font-size: 1.8em; margin-top: 40px; color: #ff5722;'>Des Amis Précieux</h2>
      <p style='text-indent: 2em;'>${childName} savait que les grandes aventures sont toujours meilleures avec des amis. Rapidement, ${childName} fut rejoint(e) par :</p>
      <ul style='list-style-type: disc; margin-left: 2em; margin-top: 1em;'>
        ${characters.map(char => `<li><strong style='color: #4CAF50;'>${char.name || 'Un ami'}</strong>, qui était ${char.relationshipToHero || 'un compagnon loyal'} et apportait toujours ${char.relationshipToHero === 'un animal' ? 'sa loyauté' : 'de la sagesse'}.</li>`).join('')}
      </ul>
      <p style='text-indent: 2em; margin-top: 1em;'>Ensemble, ils apprirent l'importance de la ${selectedValues[0]?.name || 'solidarité'} et de l'${selectedValues[1]?.name || 'empathie'}, des qualités essentielles pour surmonter les obstacles.</p>
    `);
  }

  // --- Page 4 : Le Défi et la Leçon ---
  content.push(`
    <h2 style='font-size: 1.8em; margin-top: 40px; color: #ff5722;'>Le Grand Défi</h2>
    <p style='text-indent: 2em;'>Leur chemin les mena à la mystérieuse ${storyLocation || 'montagne lointaine'}. Un ancien gardien les attendait, proposant un défi qui nécessitait une grande ${selectedValues[2]?.name || 'créativité'} et une ${selectedValues[3]?.name || 'persévérance'} inébranlable.</p>
    <p style='text-indent: 2em;'>Avec un esprit d'équipe et en utilisant toutes leurs ressources, ${childName} et ses amis résolurent l'énigme. Ils comprirent alors que la vraie force ne réside pas dans la puissance, mais dans la ${selectedValues[4]?.name || 'gentillesse'} et la capacité à travailler ensemble.</p>
  `);

  // --- Page 5 : La Victoire et le Retour ---
  content.push(`
    <h2 style='font-size: 1.8em; margin-top: 40px; color: #ff5722;'>Un Héros au Cœur Grand</h2>
    <p style='text-indent: 2em;'>De retour à ${city || 'sa maison'}, ${childName} n'était plus le/la même. Son aventure l'avait transformé(e) en un(e) véritable héros/héroïne, non pas par des exploits de force, mais par les valeurs de ${selectedValues[0]?.name || 'partage'} et de ${selectedValues[1]?.name || 'respect'} qu'il/elle avait incarnées.</p>
    <p style='text-indent: 2em;'>${childName} racontait son histoire à tous, inspirant son entourage à chercher sa propre aventure et à embrasser les valeurs qui rendent la vie si belle.</p>
  `);

  // --- Page Finale : Message Spécial (si fourni) et Conclusion ---
  if (messageSpecial) {
    content.push(`
      <h2 style='font-size: 1.8em; margin-top: 40px; text-align: center; color: #ff5722;'>Un message spécial pour ${childName}</h2>
      <p style='font-style: italic; text-align: center; border: 1px dashed #ff9800; padding: 15px; background-color: #fff3e0;'>"${messageSpecial}"</p>
    `);
  }
  content.push(`
    <p style='text-align: center; font-size: 1.5em; margin-top: 50px; color: #ff5722;'>Fin de l'histoire.</p>
    <p style='text-align: center; font-style: italic; color: #757575;'>Continuez à explorer le monde avec ${childName} !</p>
  `);

  return content;
}