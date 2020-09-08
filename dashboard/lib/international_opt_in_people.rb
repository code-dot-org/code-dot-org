#
# These lists of international facilitators and partners are used by the form at
# /pd/international_workshop which creates an InternationalOptIn.  They are
# stored separately here so that they can be modified directly.
#
module InternationalOptInPeople
  INTERNATIONAL_OPT_IN_FACILITATORS = [
    "Centro de Innovación - Mineduc",
    "Eleanor Cheah",
    "Rodrigo Fabrega",
    "Weena Naowaprateep",
    "Beth Zigmont & Hana Zimmerman Karl",
    "María Cristina Charters",
    I18n.t('pd.international_opt_in.facilitator_not_listed'),
    I18n.t('pd.international_opt_in.facilitator_not_applicable')
  ].freeze

  INTERNATIONAL_OPT_IN_PARTNERS = [
    "Aksorn",
    "Computadores para Educar",
    "Cuantrix",
    "Fundacion Kodea",
    "Malaysia Digital Economy Corporation",
    "Mineduc",
    "Wix.com",
    I18n.t('pd.international_opt_in.organizer_not_listed')
  ].freeze
end
