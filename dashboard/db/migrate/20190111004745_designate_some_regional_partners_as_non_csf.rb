class DesignateSomeRegionalPartnersAsNonCsf < ActiveRecord::Migration[5.0]
  def up
    RegionalPartner.where.not(id: [2, 3, 4, 44, 55, 80]).each {|partner| partner.update(has_csf: true)}
  end

  def down
    # no-op, because the old serialized property isn't accessible.
  end
end
