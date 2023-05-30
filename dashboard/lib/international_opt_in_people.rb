#
# These lists of international facilitators and partners are used by the form at
# /pd/international_workshop which creates an InternationalOptIn.  They are
# stored separately here so that they can be modified directly.
#
module InternationalOptInPeople
  partners = {
    barbados: ["The Trust for the Americas"],
    belize: ["The Trust for the Americas"],
    thailand: ["Aksorn"],
    colombia: ["Computadores para Educar"],
    chile: ["Fundacion Kodea", "Mineduc"],
    paraguay: ["Paraguay Educa"],
    malaysia: ["Malaysia Digital Economy Corporation"],
    israel: ["Wix.com"],
    mexico: ["Cuantrix"],
    uzbekistan: ["IT Park"]
  }

  INTERNATIONAL_OPT_IN_PARTNERS = (partners.each_value do |partner_list|
    partner_list.append(
      I18n.t('pd.international_opt_in.organizer_not_listed')
    )
  end).freeze
end
