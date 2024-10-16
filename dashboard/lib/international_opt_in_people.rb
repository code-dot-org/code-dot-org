#
# These lists of international facilitators and partners are used by the form at
# /pd/international_workshop which creates an InternationalOptIn.  They are
# stored separately here so that they can be modified directly.
#
module InternationalOptInPeople
  partners = {
    antigua_and_barbuda: ["iLabGlobal Inc | Caribbean Tech Genius Foundation"],
    australia: ["Grok Academy"],
    barbados: ["The Trust for the Americas"],
    belize: ["The Trust for the Americas"],
    botswana: ["CSEdBotswana"],
    brazil: ["ENTER Tech Edu", "Federal University of Amapá - UNIFAP", "Secretariat of Education of Rio Grande do Sul"],
    cambodia: ["Tech for Kids Academy"],
    canada: ["Digital Moment"],
    chile: ["Kodea", "Mineduc"],
    colombia: ["ARUKAY", "Computadores para Educar", "Fundación Pies Descalzos", "Universidad Católica Luis Amigó"],
    dominican_republic: ["The Trust for the Americas"],
    ecuador: ["Montebello Academy", "Progracademy"],
    egypt: ["Little Coder Academy"],
    india: [
      "Asha for Education (Asha Chennai)", "Aveti Learning", "Cognizant", "Educational Initiatives",
      "India Literacy Project", "Leadership for Equity", "Literacy India", "NavGurukul Foundation for Social Welfare",
      "Nirmaan Organization", "Peepul", "Quest Alliance"
    ],
    indonesia: ["Coding Bee Academy", "Koding Next", "Optima Tech Academy", "Prestasi Junior Indonesia"],
    israel: ["Wix.com"],
    italy: ["Programma il Futuro"],
    jamaica: ["The Trust for the Americas"],
    kenya: ["STEAMLabs Africa", "Uzima Aid"],
    kosovo: ["SHPIK"],
    malaysia: ["Fondation Rolf Schnyder", "Malaysia Digital Economy Corporation"],
    maldives: ["Women in Tech Maldives"],
    malta: ["Directorate for Digital Literacy and Transversal Skills"],
    mexico: ['Colegio Nikola Tesla', "Fundación Televisa - Cuantrix"],
    mongolia: ["Codercub"],
    new_zealand: ["OMGTech!"],
    panama: ["SENACYT"],
    paraguay: ["Paraguay Educa"],
    peru: ["Instituto San Agustín - ISAT", 'Sumatec - Code en mi Cole'],
    philippines: ["CHED and NTC", "Computer Science Teachers Association Philippines"],
    portugal: ["ANPRI", "DRE - Direção Regional de Educação (Madeira)"],
    puerto_rico: ["Department of Economic Development"],
    romania: ["ADFABER"],
    slovakia: ["Accenture / PKDK", "Informatika 2.0"],
    south_africa: ["ITC Club Mpumalanga ( Mpumalanga ICT Club)"],
    south_korea: ["Future Class Network", "KISEF", "AIEDAP", "Korea National University of Education"],
    spain: ["eTwinz Education", "Exitoeducativo", "Generacion code"],
    sri_lanka: ["Shilpa Sayura Foundation", "Spectrum Institute of Technology"],
    thailand: ["Aksorn", "Edpresso", "Spark Education / เรียนวิธีคิด ผ่านวิธีโค้ด"],
    trinidad_and_tobago: ["The Trust for the Americas"],
    uruguay: ["Ceibal", "Elemental"],
    uzbekistan: ["IT Park"],
    vietnam: ["Vietnet-ICT"]
  }

  INTERNATIONAL_OPT_IN_PARTNERS = (partners.each_value do |partner_list|
    partner_list.append(
      I18n.t('pd.international_opt_in.organizer_not_listed')
    )
  end).freeze
end
