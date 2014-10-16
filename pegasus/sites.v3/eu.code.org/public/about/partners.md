
# Partners

<%= view :logos_with_description, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'eu') %>