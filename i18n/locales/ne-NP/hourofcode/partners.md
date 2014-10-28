* * *

शीर्षक: साझेदारहरू

* * *

# मुख्य साझेदारहरू र सहयोगी समर्थकहरू

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Hour of Code को प्रवर्द्धनात्मक साझेदारहरू

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# अभ्यासका साझेदाहरू

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# अतिरिक्त साझेदारहरू

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>