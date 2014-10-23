* * *

pošiljatelj: '"Hadi Partovi (Code.org)" [&#104;&#x61;&#x64;&#105;&#x5f;&#112;&#x61;&#x72;&#116;&#x6f;&#118;&#x69;&#x40;&#99;&#x6f;&#100;&#x65;&#x2e;&#111;&#x72;&#103;](&#109;&#x61;&#105;&#x6c;&#x74;&#111;&#x3a;&#104;&#x61;&#x64;&#105;&#x5f;&#112;&#x61;&#x72;&#116;&#x6f;&#118;&#x69;&#x40;&#99;&#x6f;&#100;&#x65;&#x2e;&#111;&#x72;&#103;)' predmet: Hvala što ste se prijavili biti domaćinom Sata Kodiranja! prikaz: nema tema: nema

* * *

<% hostname = CDO.canonical_hostname('hourofcode.com') %>

# Thanks for signing up to host an Hour of Code!

**SVAKI** organizator sata kodiranja primit će 10 GB Dropbox pohrane ili 10 dolara Skype kredita u znak zahvale. [Detalji](http://<%= hostname %>/prizes)

<% if @country == 'us' %>

Pripravite [cijelu školu za sudjelovanje](http://<%= hostname %>/whole-school) kako bi osvojili velike nagrade za školu.

<% end %>

## 1. Spread the word

Tell your friends about the #HourOfCode.

<% if @country == 'us' %>

## 2. Ask your whole school to offer an Hour of Code

[Pošaljite ovu poruku](http://<%= hostname %>/resources#email) ili [dajte ovaj letak ravnatelju škole](http://<%= hostname %>/files/schools-handout.pdf). Nakon što škola odluči sudjelovati, [prijavite se da bi osvojili tehnologiju u vrijednosti od 10 tisuća dolara za vašu školu](http://<%= hostname %>/prizes) i izazovite ostale škole u vašoj okolici da i one sudjeluju.

<% else %>

## 2. Ask your whole school to offer an Hour of Code

[Pošaljite ovu poruku](http://<%= hostname %>/resources#email) ili [dajte ovaj letak ravnatelju škole](http://<%= hostname %>/files/schools-handout.pdf).

<% end %>

## 3. Zamolite svog poslodavca da sudjeluje

[Pošaljite ovu poruku](http://<%= hostname %>/resources#email) svom nadređenom ili rukovodiocu. Možete im također [uručiti ovaj letak](http://<%= hostname %>/files/schools-handout.pdf).

## 4. Promovirajte Sat Kodiranja u svojoj zajednici

Pridobijte lokalne grupe - izviđače, crkvu, sveučilište, branitelje ili radnički sindikat. Možete biti domaćin Sata Kodiranja i u svom susjedstvu.

## 5. Zamolite mjesno izabranog dužnosnika da pruži podršku Satu Kodiranja

[Pošaljite ovu poruku](http://<%= hostname %>/resources#politicians) svome gradonačelniku, gradskom vijeću ili školskom odboru. Ili im [dajte ovu brošuru](http://<%= hostname %>/resources/hoc-one-pager.pdf) i pozovite ih da posjete vašu školu.

<% if @country == 'ro' %>

Multumim ca ne-ai anuntat despre evenimentul tau! Anunta-ne daca doresti informatii suplimentare sau daca ai intrebari. Hai sa facem istorie impreuna!

Echipa Hour of Code Romania hoc@adfaber.org

<% end %>

* * *

Code.org je 501c3 neprofitna organizacija. Naša adresa je 1301 5th Ave, Suite 1225, Seattle, WA, 98101, USA. Ne želite primati ove elektronske poruke? [Otkažite pretplatu](%= unsubscribe_link %).

![](<%= tracking_pixel %>)