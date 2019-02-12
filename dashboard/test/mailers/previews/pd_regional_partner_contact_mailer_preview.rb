# This can be viewed on non-production environments at /rails/mailers/pd/regional_partner_contact_mailer
class Pd::RegionalPartnerContactMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def contact_receipt_with_partner
    rp = build :regional_partner
    rp_contact = build :pd_regional_partner_contact, regional_partner: rp
    form = rp_contact.sanitize_and_trim_form_data_hash

    Pd::RegionalPartnerContactMailer.receipt(form, rp)
  end

  def contact_receipt_no_partner
    rp_contact = build :pd_regional_partner_contact
    form = rp_contact.sanitize_and_trim_form_data_hash

    Pd::RegionalPartnerContactMailer.receipt(form, nil)
  end
end
