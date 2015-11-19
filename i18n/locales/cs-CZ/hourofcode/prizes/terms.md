* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Podmínky cen

## Kredit na Amazon.com, iTunes a Windows Store:

Výhra kreditu na Amazon.com, iTunes a na Windows Store je omezena pouze na školy K-12, vyučující kroužků (mimo vyučování) a vzdělávací spolky. Kredit $10 musí být přidán k již existujícímu účtu a platí pouze 1 rok. Omezení na jednu odměnu na organizátora.

Každý organizátor se musí zaregistrovat na Hodinu kódu, aby mohl obdržet kredit na Amazon.com, iTunes nebo na Windows Store. Jestli-li se vaše celá škola zúčastní Hodiny kódu, každý pedagog se musí jednotlivě zaregistrovat jako organizátor, aby získal právo na cenu.

Code.org po Hodině kódu (7-13. prosince) kontaktuje organizátory s instrukcemi, jak uplatnit kredit na Amazon.com, iTunes a Windows Store.

<% if @country == 'us' %>

## Sada notebooků (nebo pro jiné technologie za 10 000 dolarů) pro třídu:

Cena je omezená pouze na USA veřejné K-12 školy. Abyste se kvalifikovali, celá vaše škola se musí registrovat do Hodiny kódu před 16. listopadem 2015. Jedna škola v každém státě USA obdrží sadu počítačů pro třídu. Code.org vybere a ozve se vítězům emailem do 1. prosince, 2015.

Aby bylo jasno, toto není loterie nebo soutěž s jistou výhrou.

1) Není zde žádný poplatek nebo riziko spojené s účastí v této soutěži - jakákoliv škola nebo třída se může účastnit, bez poplatků Code.org nebo jiné organizaci

2) Vítězové budou vybráni pouze mezi školami, kde se celé třídy (nebo školy) podílely na Hodině kódu, který zahrnuje kolektivní test dovedností studentů a učitelů.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video chat s pozvaným řečníkem:

Cena pouze pro K-12 třídy v Usa a Kanada. Code.org vybere výherní třídy, poskytne časový otvor pro web chat, a bude pracovat s danými učitely, k nastavení technologických detajlů. Celá škola není třeba uplatňovat nárok na tuto cenu. Veřejné a soukromé školy mají nárok na výhru.

<% end %>

<%= view :signup_button %>