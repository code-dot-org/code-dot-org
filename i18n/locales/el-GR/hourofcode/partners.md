* * *

τίτλος: Συνεργάτες

* * *

# Κύριοι Συνεργάτες και Εταιρικοί Υποστηρικτές

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Συνεργάτες Προώθησης της Ώρας του Κώδικα

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# Συνεργάτες Εκπαιδευτικών Οδηγών

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Άλλοι Συνεργάτες

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>