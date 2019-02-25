class Api::V1::Pd::RegionalPartnerMiniContactsController < Api::V1::Pd::FormsController
  skip_before_action :verify_authenticity_token

  def new_form
    @contact_form = ::Pd::RegionalPartnerMiniContact.new
  end
end
