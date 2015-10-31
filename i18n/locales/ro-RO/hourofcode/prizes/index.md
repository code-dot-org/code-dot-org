* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premiile evenimentului Hour of Code 2015

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% if @country == 'la' %>

# Premii pentru fiecare organizator

Fiecare educator sau profesor ce va organiza un eveniment Hour of Code pentru elevii sai va primi 10 GB spațiu Dropbox ca un cadoul de multumire!

<% else %>

## Premii pentru FIECARE organizator

**Fiecare** educator care găzduieşte o Ora de Programare este eligibil pentru a primi **$10 la Amazon.com, iTunes sau Windows Store** ca un cadou de mulţumire!

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 de şcoli vor primi un set de laptop-uri pentru fiecare clasa ( sau alte device-uri tehnologice in valoare de 10.000 de dolari)

O scoala norocoasa din *fiecare* stat american (inclusiv Washington D.C) va castiga echipament tech in valoare de 10.000 de dolari. [Inregistreaza-te aici](%= resolve_url('/prizes/hardware-signup') %) pentru a fi eligibil si [**vezi castigatorii de anul trecut.**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# Întrebări frecvente

## Cine este eligibil pentru a primi cadourile de mulțumire destinate organizatorilor?

Ambele tipuri de şcoli - americane sau non-americane: toti organizatorii sunt eligibili si pot primi cadouri de multumire. Premiul de 10 000 de dolari in produse hardware este limitat doar in Statele Unite ale Americii.

## Este vreun termen limita în a te inscrie pentru a primi premiul universal pentru organizatori?

Trebuie să te inregistrezi **înainte de** <%= campaign_date('start_long') %> pentru a fi eligibil sa primesti toate cadourile de multumire ale organizatorilor.

## Cand îmi voi primi cadoul de mulțumire?

Va vom contacta in decembrie după Saptamana Educatiei in tehnologia computerelor(<%= campaign_date('full') %>) cu următorii paşi pentru a intra in posesia premiilor de multumire.

## Pot intra in posesia tuturor variantelor de premii de multumire?

Nu. Cadourile de multumire sunt limitate - unul pentru fiecare organizator. Te vom contacta in decembrie, dupa Saptamana Educatiei in tehnologia computerelor si iti vom spune pasii ce trebuie urmati pentru a-ti revendica premiul.

<% if @country == 'us' %>

## Intreaga şcoală trebuie sa participe pentru a câştiga 10.000 dolari în echipamente hardware?

Da. Intreaga scoala ar trebui sa participe pentru a fi eligibila premiului insa doar o singura persoana trebuie sa o inregistreze si sa completeze formularul de aplicare pentru premiul hardware[aici](%= resolve_url('/prizes/hardware-signup') %). Fiecare profesor participant va trebui sa[isi inscrie](%= resolve_url('/') %)clasa individual cu scopul de a primi tot cadoul de multumire pentru organizator.

## Cine este eligibil pentru a primi premiul de produse hardware in valoare de 10.000 de dolari?

Premiul limitat numai pentru şcoli publice din Sua. Pentru a te califica, intreaga scoala trebuie sa fie inregistrata pentru evenimentul Hour of Code pana pe 16 noiembrie 2015. O şcoală din fiecare stat al Sua va primi un set de calculatoare pentru clasă. Code.org va selecta si anunta castigatorii prin e-mail pana pe 1 decembrie 2015.

## De ce premiul de 10.000 dolari in echipamente tehnologice este disponibil numai pentru şcolile publice?

Ne-ar plăcea sa putem ajuta profesorii din scolile publice şi şcolile private deopotrivă, dar în acest moment, este vorba doar de logistica. Avem un parteneriat cu [DonorsChoose.org](http://donorschoose.org) ca să administreze premii cu finanţarea în clase, care funcţionează numai cu şcoli publice. Potrivit DonorsChoose.org, organizarea este mai în măsură să acceseze date consecvente şi exacte, care sunt disponibile pentru scolile publice.

## Când este termenul limită pentru aplicarea la Premiul hardware?

Pentru a te califica, trebuie sa completezi [formularul de aplicație pentru premiul hardware](%= resolve_url('/prizes/hardware-signup') %)pana pe 16 noiembrie, 2015. O şcoală din fiecare stat al Sua va primi un set de calculatoare pentru clasă. Code.org va selecta si anunta castigatorii prin e-mail pana pe 1 decembrie 2015.

<% end %>

## Dacă scoala mea nu va face in intregime evenimentul Hour of Code in cursul Saptamanii Educatiei in Tehnologia computerelor (<%= campaign_date('short') %>), ma pot califica pentru premii?

Da, in [formularul de aplicare pentru premiul Hardware](%= resolve_url('/prizes/hardware-signup') %)sunt incluse datele in care toata scoala ta a participat.

## Eu sunt în afara Statelor Unite. Ma pot califica pentru premii?

Da. Toti organizatorii, indiferent daca sunt din US sau nu, sunt eligibili pentru premiul de mulțumire al organizatorilor. Insa, premiul de 10000 de dolari in echipamente hardware este valabil numai pentru US.

<% end %> <%= view :signup_button %>