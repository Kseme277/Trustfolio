'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import './SectionTemoignages.css';

const temoignages = [
  {
    texte: "Grâce à Trustfolio, mon enfant a pu découvrir des histoires inspirantes et personnalisées. Le livre a vraiment boosté sa confiance en lui !",
    points: ['Personnalisation', 'Valeurs', 'Qualité'],
    nom: 'Awa',
    type: 'Parent',
    image: '/ines-murielle.jpg',
  },
  {
    texte: "J’ai adoré la facilité de création du livre. L’IA m’a aidé à trouver les mots justes pour mon fils. Un cadeau unique et éducatif !",
    points: ['Facilité', 'IA', 'Cadeau unique'],
    nom: 'Karim',
    type: 'Parent',
    image: '/appelez-moi-de-temps-en-temps-portrait-d-un-homme-afro-americain-effronte-et-confiant-montrant-un-signe-de-telephone-pres-de-la-tete-et-souriant.jpg',
  },
  {
    texte: "Le livre personnalisé a permis à ma fille de s’identifier à l’héroïne. Elle veut déjà en créer un autre !",
    points: ['Identification', 'Héroïne', 'Engagement'],
    nom: 'Fatou',
    type: 'Parent',
    image: '/beau-jeune-mec-posant-contre-le-mur-blanc.jpg',
  },
  {
    texte: "En tant qu’enseignant, j’ai trouvé l’approche Trustfolio très pertinente pour transmettre des valeurs à mes élèves.",
    points: ['Pédagogie', 'Valeurs', 'Culture africaine'],
    nom: 'M. Diop',
    type: 'Enseignant',
    image: '/homme-americain-africain-pointage.jpg',
  },
];

const SectionTemoignages = () => (
  <section className="section-temoignages dark:bg-gray-900 ">
    <h2 className="temoignages-title dark:text-white">
      Ils en parlent <span className="temoignages-accent">mieux</span> que nous
    </h2>
    <Swiper
      modules={[Pagination, EffectCoverflow]}
      effect="coverflow"
      coverflowEffect={{ rotate: 30, stretch: 0, depth: 120, modifier: 1, slideShadows: false }}
      centeredSlides={true}
      slidesPerView={'auto'}
      spaceBetween={32}
      pagination={{ clickable: true }}
      className="temoignages-swiper"
      breakpoints={{
        0: { slidesPerView: 1, centeredSlides: false },
        700: { slidesPerView: 'auto', centeredSlides: true },
      }}
    >
      {temoignages.map((t, i) => (
        <SwiperSlide className="temoignage-slide" key={i}>
          <div className="temoignage-card dark:bg-gray-800 dark:shadow-lg dark:border-gray-700">
            {/* Image de la personne dans un rond */}
            <div style={{width:'70px',height:'70px',margin:'0 auto',marginBottom:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <img src={t.image} alt={t.nom} className="rounded-full object-cover border-2 border-orange-400 shadow dark:border-orange-500 dark:shadow-md" style={{width:'70px',height:'70px'}} />
            </div>
            <p className="temoignage-texte dark:text-gray-200">{t.texte}</p>
            <div className="temoignage-points">
              <span className="temoignage-points-label">Points forts</span>
              {t.points.map((p, j) => (
                <span className="temoignage-point dark:bg-orange-900/40 dark:text-orange-300" key={j}>{p}</span>
              ))}
            </div>
            <div className="temoignage-nom dark:text-white">{t.nom}</div>
            <div className="temoignage-type dark:text-gray-400">{t.type}</div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

export default SectionTemoignages; 