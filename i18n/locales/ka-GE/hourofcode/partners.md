* * *

სათაური: პარტნიორები

* * *

# მთავარი პარტნიორები და კორპორატიული სპონსორები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# მთავარი სარეკლამო პარტნიორები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# საერთაშორისო პარტნიორები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# პარტნიორები სასწავლო მასალაში

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# ინფრასტრუქტურის პარტნიორები და ინსტრუმენტები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# დამატებითი პარტნიორები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>