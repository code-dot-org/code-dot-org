* * *

title: <%= hoc_s(:title_stats) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

# Fakta a užitečné statistiky

## Použijte tuto krátkou záložku v bulletinu

### Dostantě počítačovou vědu do vaší školy. Začněte s Hodinou kódu

Počítače jsou všude, ale dnes vyučuje informatiku méně škol než tomu bylo před 10 lety. Dobrou zprávou je, že jsme na cestě, jak to změnit. Pokuď jste slyšeli o [Hodině kódu](%= resolve_url('/') %) minulý rok, mohli byste vědět, že vstoupila do historie. V první Hodině kódu, 15 miliónů studentů vyzkoušelo počítačové vědy. Minulý rok se počet zvýšil na 60 miliónů studentů! [Hodina kódu](%= resolve_url('/') %) je jednohodinový vstup do počítačových věd, vytvořený aby demystifikoval kód a ukázal, že kdokoliv se může naučit základy. [přihlašte se](%= resolve_url('/') %) k hostování Hodiny kódu tento <%= campaign_date('full') %> v průběhu Počítačově vědního naučného týdne. K přidání vaší školy na mapu, jdite na https://hourofcode.com/<%= @country %>

## Infografiky

<%= view :stats_carousel %>

<%= view :signup_button %>