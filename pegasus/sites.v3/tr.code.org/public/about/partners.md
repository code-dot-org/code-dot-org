---
title: The Hour of Code
tagline: ''
theme: responsive
responsivePadMobile: yes
social:
  'og:title' : 'Her çocuk bir fırsatı hak eder.'
  'og:description' : "Öğrenciler ve Sınıflar; Kod Saatine sadece bir saatinizi ayırarak programlamanın ne kadar eğlenceli olduğunu keşfedin"
  'og:image' : "http://<%=request.host%>/images/ogimage.png"
  "og:image:width": 1705
  "og:image:height": 949
  "og:url": "http://tr.code.org"
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---

<div class="container-wrap">
  <div class="container main-content">
    <div class="row">
      <h1 class="text-align-center">Türkiye Ortaklarımız</h1>
      <div class="row">
        <div class="col-sm-3 col span_3">
          <div class="logo_column text-align-center" style="display: table; height: 160px; width: 100%;">
            <a style="display: table-cell; vertical-align: middle; text-align: center;" href="https://www.netacad.com/" target="_blank"><img style="max-width: 100%" src="/images/Cisco-Networking-Academy.png"></a>
          </div>
          <div class="logo_column text-align-center" style="display: table; height: 160px; width: 100%;">
            <a style="display: table-cell; vertical-align: middle; text-align: center;" href="https://www.microsoft.com/tr-tr/" target="_blank"><img style="max-width: 100%" src="/images/Microsoft.png"></a>
          </div>
        </div>
        <div class="col-sm-3 col span_3">
          <div class="logo_column text-align-center" style="display: table; height: 160px; width: 100%;">
            <a style="display: table-cell; vertical-align: middle; text-align: center;" href="https://www.google.com/nonprofits/" target="_blank"><img style="max-width: 100%" src="/images/Google-for-Nonprofits.png"></a>
          </div>
          <div class="logo_column text-align-center" style="display: table; height: 160px; width: 100%;">
            <a style="display: table-cell; vertical-align: middle; text-align: center;" href="https://www.oracle.com/tr/index.html" target="_blank"><img style="max-width: 100%" src="/images/Oracle-Academy.png"></a>
          </div>
        </div>
        <div class="col-sm-3 col span_3">
          <div class="logo_column text-align-center" style="display: table; height: 160px; width: 100%;">
            <a style="display: table-cell; vertical-align: middle; text-align: center;" href="http://www.gyctrade.com/?Lang=TR" target="_blank"><img style="max-width: 100%" src="/images/GYC-Trade.png"></a>
          </div>
          <div class="logo_column text-align-center" style="display: table; height: 160px; width: 100%;">
            <a style="display: table-cell; vertical-align: middle; text-align: center;" href="https://www.paypal.com/tr/home" target="_blank"><img style="max-width: 100%" src="/images/Paypal.png"></a>
          </div>
        </div>
      </div>
    </div><!--/row-->
  </div><!--/container main-content-->
</div>

# Ana Ortaklarımız

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

---

# Ders Ortaklarımız

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>
