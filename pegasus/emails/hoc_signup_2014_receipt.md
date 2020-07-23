---
from: "Hadi Partovi (Code.org) <hadi_partovi@code.org>"
subject: "Thanks for signing up to host an Hour of Code!"
---
<% hostname = CDO.canonical_hostname('hourofcode.com') %>

<% if @country == 'ro' %>

Va multumim pentru inregistrare. Daca aveti nevoie de ajutor sau aveti orice intrebare contactati Echipa Hour of Code Romania la adresa: hoc@adfaber.org.

<% end %>

# Thanks for signing up to host an Hour of Code!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](http://<%= hostname %>/prizes)

## 1. Spread the word
Tell your friends about the #HourOfCode.

<% if @country == 'us' %>

## 2. Ask your whole school to offer an Hour of Code
[Send this email](http://<%= hostname %>/resources#email) or give [this handout](http://<%= hostname %>/files/schools-handout.pdf) to your principal.

<% end %>

## 3. Ask your employer to get involved
[Send this email](http://<%= hostname %>/resources#email) to your manager, or the CEO. Or [give them this handout](http://<%= hostname %>/resources/hoc-one-pager.pdf).

## 4. Promote Hour of Code within your community
Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Ask a local elected official to support the Hour of Code
[Send this email](http://<%= hostname %>/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](http://<%= hostname %>/resources/hoc-one-pager.pdf) and invite them to visit your school.

<hr/>

Code.org is a 501c3 non-profit. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101. Don't like these emails? [Unsubscribe](<%= local_assigns.fetch(:unsubscribe_link, "") %>).

