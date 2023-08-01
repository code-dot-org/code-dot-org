#
# These lists of international facilitators and partners are used by the form at
# /pd/international_workshop which creates an InternationalOptIn.  They are
# stored separately here so that they can be modified directly.
#
module InternationalOptInPeople
  partners = {
    australia: ["Grok Academy"],
    brazil: ["ENTER Tech Edu"],
    barbados: ["The Trust for the Americas"],
    belize: ["The Trust for the Americas"],
    colombia: ["Computadores para Educar"],
    chile: ["Kodea", "Mineduc"],
    dominican_republic: ["The Trust for the Americas"],
    india: [
      "Asha for Education (Asha Chennai)", "Educational Initiatives", "Leadership for Equity", "Literacy India",
      "NavGurukul Foundation for Social Welfare", "Nirmaan Organization", "Peepul", "Quest Alliance"
    ],
    indonesia: ["Coding Bee Academy"],
    israel: ["Wix.com"],
    jamaica: ["The Trust for the Americas"],
    kenya: ["STEAMLabs Africa"],
    kosovo: ["SHPIK"],
    malaysia: ["Malaysia Digital Economy Corporation"],
    maldives: ["Women in Tech Maldives"],
    mexico: ["Fundación Televisa - Cuantrix"],
    mongolia: ["Codercub"],
    new_zealand: ["OMGTech!"],
    paraguay: ["Paraguay Educa"],
    portugal: ["DRE - Direção Regional de Educação (Madeira)"],
    slovakia: ["Accenture / Informatika 2.0"],
    south_korea: ["Future Class Network", "KISEF", "AIEDAP"],
    spain: ["Generacion Code / Ewolucion apps"],
    thailand: ["Aksorn"],
    trinidad_and_tobago: ["The Trust for the Americas"],
    uzbekistan: ["IT Park"],
    vietnam: ["Vietnet-ICT"]
  }

  INTERNATIONAL_OPT_IN_PARTNERS = (partners.each_value do |partner_list|
    partner_list.append(
      I18n.t('pd.international_opt_in.organizer_not_listed')
    )
  end).freeze
end
