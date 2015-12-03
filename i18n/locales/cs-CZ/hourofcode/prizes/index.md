* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: how_to_nav

* * *

<%= view :signup_button %>

# Ceny za Hodinu kódu 2015

<% if @country == 'la' %>

# Ocenění pro každého organizátora

Každý, kdo bude pořádat Hodinu kódu pro studenty získá 10 GB místa na Dropbox jako dárek!

<% else %>

## Ceny pro KAŽDÉHO organizátora

**Každý** organizátor Hodiny kódu dostane jako poděkování **$10 na Amazon.com, iTunes nebo Windows Store**!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

* Do vyčerpání zásob

<% if @country == 'us' %>

## 51 škol vyhraje notebooky pro celou třídu (nebo $10,000 na ostatní technologie)

Přihlášení k této ceně je nyní uzavřeno. Zkontrolujte si zpětně letošní vítěze.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' || @country == 'ca' %>

<a id="video-chats"></a>

## 30 tříd vyhraje video chat s hostujícím přednášejícím

Šťastné třídy budou mít příležitost mluvit s hosty, kteří budou sdílet, jak informatika ovlivnila jejich životy a kariéry.

[col-33]

![obrázek](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(spolu-zakladatel a CEO Instagram)   
[sledujte live v 9. prosince 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![obrázek](/images/fit-175/Dao_Nguyen.jpg)  
DAO Nguyen   
(Vydavatel, Buzzfeed)   
[sledujte 7. prosince 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![obrázek](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(zpěvačka)   
[sledujte 8. prosince 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![obrázek](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Vedoucí odboru zkušeností, Microsoft)   


[/col-33]

[col-33]

![obrázek](/images/fit-175/Hadi-Partovi.jpg)  
Hadi Partovi   
(spoluzakladatel Code.org)   
[sledujte živě 11. prosince 10 am PST](https://plus.google.com/events/c2e67fd7el3es36sits1fd67prc)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## Jedna šťastná třída vyhraje exkluzivní výle do zákulisí "Dělání Hvězdných válek" v San Francisco, Disney a Lucasfilm

Jedna šťastná třída vyhraje hlavní cenu – výlet do San Francisco, CA, protože exkluzivní pohled do zákulisí "Dělání Star Wars" zkušenosti týmu vizuálních efektů, který pracoval na Star Wars: Síla se probouzí. Hlavní cenou je s laskavým svolením [ILMxLAB](http://www.ilmxlab.com/), nová laboratoř pro rozšiřování zábavy kombinující talent Lucasfilm, Industrial Light & Magic a Skywalker Sound.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize1.jpg" />

<img style="float: left; padding-right: 25px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize2.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## 100 tříd vyhraje programovatelné robotů, včetně BB-8 droid robot od Sphero

Na počest Hodiny kódu kurzu "Star Wars: stavební Galaxy s kódem" 100 zúčastněných tříd ve Spojených státech a Kanadě dostane sadu čtyř robotů Sphero 2.0 plus BB-8 ™ aplikace umožňující Droida, aby studenti mohli programovat. Přihlaste se na Hodinu kódu události, aby ses kvalifikoval. [Další informace o BB-8 od Sphero](http://sphero.com/starwars) a [o Sphero vzdělávání](http://sphero.com/education).

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-220x160/bb8.png" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-200x160/bb8-girl.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-300x160/sphero-robot.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'ro' %>

Organizatorii evenimentelor Hour of Code în România vor beneficia de un premiu din partea Bitdefender România, constand intr-o solutie de securitate online.

<% end %>

# FAQ - nejčastější dotazy

## Kdo všechno může dostat dárek pro organizátory?

Oba Us a mimo US organizátoři Hodiny kódu, mohou dostat děkovný dar, dokuď budou zásoby. $10K hardwarovou cenu mohou dostat pouze lidé žijící v US.

## Je zde nějaké deadline pro přihlášení se o dárek pro organizátory?

Musíte se přihlásit **před** <%= campaign_date('start_long') %> aby jste mohli dostat dárek pro organizátora.

## Kdy obdržím svůj dárek?

Ozveme se v prosinci po Computer Science Education Week (<%= campaign_date('full') %>) s dalším postupem, abyste dostal svůj dárek.

## Můžu si vybrat více možností dárku zároveň?

Ne. Poděkování ve formě daru jsou omezeny na jednoho organizátora do vyčerpání zásob. Budeme vás kontaktovat v prosinci po Týdnu vzdělávání informatiky s dalšími kroky, jak uplatnit dárek.

<% if @country == 'us' %>

## Musí do soutěže vstoupit celá škola, aby vyhrála Hardware v hodnotě $10 000?

Ano. Vaše celá škoda se musí účastnit abyste mohli vyhrát cenu, ale jenom jedna osoba se musí zaregistrovat a odeslat přihlášku pro získání hardwarové ceny [zde](%= resolve_url('/prizes/hardware-signup') %). Každý učitel, který se účastní bude muset [přihlásit](%= resolve_url('/') %) jejich třídu individuálně, aby mohl získat dárek za organizaci.

## Kdo může vyhrát hardware v hodnotě $10 000?

Cena je omezená pouze na USA veřejné K-12 školy. Abyste se kvalifikovali, celá vaše škola se musí registrovat do Hodiny kódu před 16. listopadem 2015. Jedna škola v každém státě USA obdrží sadu počítačů pro třídu. Code.org vybere a ozve se vítězům emailem do 1. prosince, 2015.

## Proč je hardwarová cena v hodnotě $10 000 dostupná pouze veřejným školám?

Rádi pomáháme všem učitelům i na veřejných, i na soukromých školách, ale nyní to kvůli logistice nejde. Jsme partneři s [DonorsChoose.org](http://donorschoose.org), kteří zařizují ceny pro školy, ale pracují pouze s veřejnými, US K-12 školami. Podle organizace DonorsChoose.org, je snadnější získat přesná a spolehlivá data o veřejných školách.

## Dokdy se musím přihlásit do soutěže o hardware?

Pro kvalifikaci do soutěže musíte vyplnit [přihlášku do soutěže o hardware](%= resolve_url('/prizes/hardware-signup') %) do 16. listopadu 2015. Jedna škola v každém státě USA obdrží sadu počítačů pro třídu. Code.org vybere a ozve se vítězům emailem do 1. prosince, 2015.

## Pokud celá moje škola se nemůže účastnit Hodiny kódu během Computer Science Education Week (<%= campaign_date('short') %>), můžu stejně soutěžit o ceny?

Ano, jenom do [přihlášky do soutěže o hardware](%= resolve_url('/prizes/hardware-signup') %) přidejte i datum, kdy se škola účastní.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video chat s pozvaným řečníkem:

Cena pouze pro K-12 třídy v Usa a Kanada. Code.org vybere výherní třídy, poskytne časový otvor pro web chat, a bude pracovat s danými učitely, k nastavení technologických detajlů. Celá škola není třeba uplatňovat nárok na tuto cenu. Veřejné a soukromé školy mají nárok na výhru.

<% end %>

## Nejsem ze Spojených států. Mám nárok na ceny?

Ano, všem pořadatelům, USA a non USA, mají nárok na všechny pořadatele poděkování dar zásob poslední. Jen cena $10K hardwaru je pro USA.

<% end %> <%= view :signup_button %>