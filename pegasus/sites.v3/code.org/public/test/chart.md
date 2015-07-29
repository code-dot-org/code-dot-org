---
title: Chart embed test
chart: true
---

# Chart embed test

This is an embedded chart:

<%= view :display_chart, id: "chart1", type: "ColumnChart", query_url: "https://docs.google.com/spreadsheets/d/1PWmXjxuN2oC-baFAe4UjL_d0s1Fu-2Vb30k7ymCxRFM/gviz/tq?gid=0&range=A1:C4&headers=1", width: 800, height: 480 %>

Here is a second chart:

<%= view :display_chart, id: "chart2", type: "PieChart", query_url: "https://docs.google.com/spreadsheets/d/1PWmXjxuN2oC-baFAe4UjL_d0s1Fu-2Vb30k7ymCxRFM/gviz/tq?gid=0&range=A1:C4&headers=1", width: 800, height: 480 %>


