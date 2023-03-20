# This can be viewed on non-production environments at /rails/mailers/pd_regional_partner_mini_contact_mailer
class PdRegionalPartnerMiniContactMailerPreview < ActionMailer::Preview
  include FactoryBot::Syntax::Methods

  def contact_receipt_with_partner
    rp = build :regional_partner
    form = build_form_data(:pd_regional_partner_mini_contact, regional_partner: rp)
    Pd::RegionalPartnerMiniContactMailer.receipt(form, rp)
  end

  def contact_receipt_no_partner
    form = build_form_data(:pd_regional_partner_mini_contact)
    Pd::RegionalPartnerMiniContactMailer.receipt(form, nil)
  end

  def mini_contact_unmatched
    form = build_form_data(:pd_regional_partner_mini_contact)
    Pd::RegionalPartnerMiniContactMailer.unmatched(form, 'test+employee@code.org')
  end

  def mini_contact_matched_partner
    rp_pm = create :regional_partner_program_manager
    form = build_form_data(:pd_regional_partner_mini_contact, regional_partner: rp_pm.regional_partner)
    Pd::RegionalPartnerMiniContactMailer.matched(form, rp_pm)
  end

  private

  def build_form_data(contact_factory, **factory_options)
    contact = build contact_factory, factory_options
    contact.sanitized_and_trimmed_form_data_hash
  end
end
