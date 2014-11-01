* * *

title: साझेदार

* * *

# मुख्या साझेदार व साझेदार कंपनीया

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# एक घंटा कोड का के विज्ञापन सम्बन्धी साझेदार

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# प्रशिक्षण पत्रोमें साझेदार

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# अतिरिक्त साझेदार

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>