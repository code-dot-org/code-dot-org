#
# These lists of international facilitators and partners are used by the form at
# /pd/international_workshop which creates an InternationalOptIn.  They are
# stored separately here so that they can be modified directly.
#
module InternationalOptInPeople
  INTERNATIONAL_OPT_IN_FACILITATORS = [
    "Centro de Innovación - Mineduc",
    "Fundacion Kodea",
    "Hana Zimmerman Karl",
    "IT Park Team",
    "Paraguay Educa",
    "Rodrigo Fabrega",
    I18n.t('pd.international_opt_in.facilitator_not_listed'),
    I18n.t('pd.international_opt_in.facilitator_not_applicable')
  ].freeze

  INTERNATIONAL_OPT_IN_PARTNERS = [
    "Aksorn",
    "Computadores para Educar",
    "Cuantrix",
    "Fundacion Kodea",
    "IT Park",
    "Malaysia Digital Economy Corporation",
    "Mineduc",
    "Paraguay Educa",
    "Wix.com",
    I18n.t('pd.international_opt_in.organizer_not_listed')
  ].freeze
end
