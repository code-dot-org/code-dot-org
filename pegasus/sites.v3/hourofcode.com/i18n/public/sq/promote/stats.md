---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---


# Njoftime dhe Statistika të domosdoshme

## Përdorni këtë njoftim të shkurtër në gazetë

### Sill shkencat kompjuterike në shkollën tuaj. Filloni me Orën e Kodimit

Kompjuterët janë kudo, por më pak shkolla e mësojnë shkencën kompjuterike tani se sa para 10 vitesh. Lajmi i mirë është se jemi në rrugë a sipër për ta ndryshuar këtë. Nëse keni dëgjuar për [Orën e Kodimit](<%= resolve_url('/') %>) vitin e kaluar, ju duhet ta dini që ka bërë histori. Në Orën e parë të Kodimit, 15 milion nxënës provuan shkencën kompjuterike. Vitin e fundit, ky numër u rrit në 60 milion nxënës! [Ora e Kodimit](<%= resolve_url('/') %>) është një orë hyrje në shkencat kompjuterike, dizenjuar të çmitizojë kodimin dhe të tregojë se kushdo mund t'i mësojë bazat e shkencave kompjuterike. [Regjistrohu](<%= resolve_url('/') %>) për të organizuar një Orë Kodimi <%= campaign_date('full') %> gjatë Javës Edukative të Shkencave Kompjuterike. Për të shtuar shkollën tuaj në hartë, shko te https://hourofcode.com/<%= @country %>

## Grafikë Informues

<%= view :stats_carousel %>

