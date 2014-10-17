* * *

Заглавие: партньори

* * *

# Основни партньори и корпоративни поддръжници

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Часът на кодирането - рекламни партньори

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# Партньори в създаването на уроци

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Допълнителни партньори

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>