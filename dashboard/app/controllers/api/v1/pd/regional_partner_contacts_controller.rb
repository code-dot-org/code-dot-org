class Api::V1::Pd::RegionalPartnerContactsController < Api::V1::Pd::FormsController
  def new_form
    ::Pd::RegionalPartnerContact.new
  end
end
