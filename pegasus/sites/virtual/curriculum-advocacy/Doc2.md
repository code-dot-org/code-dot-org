---
title: Doc 2
view: page_curriculum
theme: none
---

# Title is here

This is a second simple document with text and a chart.

<script src='https://www.google.com/jsapi'>	
</script>

<%= partial('display_chart', id: "chart1", type: "PieChart", query_url: "https://docs.google.com/spreadsheets/d/1PWmXjxuN2oC-baFAe4UjL_d0s1Fu-2Vb30k7ymCxRFM/gviz/tq?gid=0&range=A1:C4&headers=1", width: 800, height: 480) %>

<link rel="stylesheet" type="text/css" href="morestyle.css"/>