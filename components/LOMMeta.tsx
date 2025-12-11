export default function LOMMeta() {
  const metadata = {
    "@context": "https://schema.org/",
    "@type": "LearningResource",
    name: "Rotinas Ilustradas – Objeto de Aprendizagem para Crianças Neurodivergentes",
    description:
      "Objeto de aprendizagem interativo que apresenta cartões de rotina com temporizadores ilustrativos, reforço sonoro e feedback visual",
    interactivityType: "active",
    learningResourceType: "educational game",
    educationalLevel: ["Educação Infantil", "Ensino Fundamental I"],
    author: [
      {
        "@type": "Person",
        name: "Eduardo Knabben de Tiyo",
        affiliation: "UTFPR - Universidade Tecnológica Federal do Paraná",
      },
      {
        "@type": "Person",
        name: "Victor Henrique Gasparoto de Almeida",
        affiliation: "UTFPR - Universidade Tecnológica Federal do Paraná",
      },
    ],
    version: "1.0",
    license: "https://creativecommons.org/licenses/by/4.0/",
    educationalUse: "practice",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(metadata) }}
    />
  );
}
