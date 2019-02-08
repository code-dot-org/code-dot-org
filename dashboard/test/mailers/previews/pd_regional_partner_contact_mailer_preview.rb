# This can be viewed on non-production environments at /rails/mailers/pd/workshop_mailer
class Pd::RegionalPartnerContactMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def contact_receipt_with_partner
    rp = build :regional_partner
    rpc = build :pd_regional_partner_contact, regional_partner: rp
    form = rpc.sanitize_and_trim_form_data_hash

    Pd::RegionalPartnerContactMailer.receipt(form, rp)
  end

  def contact_receipt_no_partner
    rpc = build :pd_regional_partner_contact
    form = rpc.sanitize_and_trim_form_data_hash

    Pd::RegionalPartnerContactMailer.receipt(form, nil)
  end
end
