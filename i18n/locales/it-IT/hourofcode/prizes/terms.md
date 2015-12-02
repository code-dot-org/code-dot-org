* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premi - Termini e condizioni di partecipazione

## Un buono acquisto per Amazon.com, iTunes e Microsoft's Windows Store:

I buoni acquisto di Amazon.com, iTunes e Microsoft's Windows Store sono limitati agli insegnanti e agli organizzatori di eventi dell'Ora del Codice. Il buono acquisto da 10$ deve essere aggiunto ad un account già esistente, e il buono scade dopo 1 anno. Ogni organizzatore può ricevere un solo premio.

Ogni organizzatore deve essere iscritto all'Ora del Codice per ricevere il buono acquisto di Amazon.com, iTunes o Microsoft's Windows Store. Se tutta la scuola partecipa all'Ora del Codice, è necessario che ogni insegnante si registri singolarmente come organizzatore.

Code.org contatterà gli organizzatori dopo la Settimana di Educazione all'Informatica promossa da l'Ora del Codice (7-13 Dic.) per fornire le istruzioni per ottenere il buono da Amazon.com, iTunes e Microsoft's Windows Store.

<% if @country == 'us' %>

## Class-set of laptops (or $10,000 for other technology):

Premi solo per le scuole pubbliche degli U.S.A. To qualify, your entire school must register for the Hour of Code by November 16, 2015. One school in every U.S. state will receive a class-set of computers. Code.org will select and notify winners via email by December 1, 2015.

Per chiarire, questo non è un concorso a premi o ad un concorso che coinvolge il puro caso.

1) non c'è alcuna partecipazione finanziaria o rischio coinvolti nell'applicazione - qualsiasi scuola o in aula può partecipare, senza alcun pagamento a Code.org o qualsiasi altra organizzazione

2) vincitori saranno selezionati solo tra le scuole in cui l'intera scuola partecipa all'Ora del Codice, che prevede una prova di abilità collettiva degli studenti e degli insegnanti.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video chat with a guest speaker:

Prize limited to K-12 classrooms in the U.S. and Canada only. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>