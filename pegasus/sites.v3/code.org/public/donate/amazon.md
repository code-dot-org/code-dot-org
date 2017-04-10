---
title: Donate to Code.org
require_https: true
theme: responsive
---

# Donate to Code.org


<script async src="https://static-na.payments-amazon.com/OffAmazonPayments/us/js/Widgets.js"></script>
<script>
$(document).on("click", '#OffAmazonPaymentsWidgets0', function(){
  if($(".ap-dw-optional-input").val() == "$0" || $(".ap-dw-optional-input").val() == "0")
  {
    $("#OffAmazonPaymentsWidgets0").prop('disabled', true);
    $(".ap-dw-button").addClass("ap-dw-error-active");
    $(".ap-dw-optional-input-container").addClass("ap-dw-error-active");
    $(".ap-dw-button").prepend( "<p id=\"error-greater-than-zero\" style=\"margin-top:10px;\"><span class=\"ap-dw-error ap-dw-error-active\">You entered an invalid amount. Please enter an amount that is at least $5.</span></p>");
  }
});

$(document).on('change', $('.ap-dw-optional-input'), function() {
  if($(".ap-dw-optional-input").val() != "$0" || $(".ap-dw-optional-input").val() != "0") {
    $("p").remove("#error-greater-than-zero");
    $("#OffAmazonPaymentsWidgets0").prop('disabled', false);
  }
});
</script>
<div data-ap-widget-type="expressDonationWidget" data-ap-widget-theme="ap-light" data-ap-widget-default-amount="other" data-ap-signature="cwbobfUuhBUatFyRW0Y5a%2FTjupmufFbmcHht7O2CWbQ%3D" data-ap-seller-id="A2ZEA2ORKPFEVK" data-ap-access-key="AKIAJG5DO6KJZKJUYENA" data-ap-lwa-client-id="amzn1.application-oa2-client.694a4a0148f74b7d8e03b28c44fcf6f9" data-ap-return-url="https://code.org/donate" data-ap-currency-code="USD" data-ap-amount="0" data-ap-note="Thank you for joining us to bring computer science to all students! Your commitment is truly making a difference and enabling students to have a bright future." data-ap-shipping-address-required="false" data-ap-payment-action="AuthorizeAndCapture" style="width: 338px"
>
</div>

<br/>

**Amazon.com customers:**
Do your shopping at [smile.amazon.com](https://smile.amazon.com/) to donate a % of all purchases to Code.org

[![image](/images/guidestar.png)](http://www.guidestar.org/organizations/46-0858543/code-org.aspx)

<br />
<br />
*Code.org is registered as a public 501(c)(3) non-profit organization.
Contributions to Code.org are tax-deductible to the extent permitted by law.
Code.org's tax identification number is 46-0858543.*
