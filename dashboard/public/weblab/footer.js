var footerContents;
var ready;
var onReadyStateChange = function(evt) {
  var readyState = evt.target.readyState;
  if ((!ready && readyState === "interactive") || readyState === "complete") {
    ready = true;
    if (footerContents) {
      applyFooter();
    }
  }
};
document.addEventListener("readystatechange", onReadyStateChange, false);

var xhr = new XMLHttpRequest();
xhr.open("GET", "/weblab/footer");
xhr.onload = function() {
  if (xhr.status === 200) {
    footerContents = xhr.responseXML.body;
    if (footerContents && ready) {
      applyFooter();
    }
  }
};
xhr.responseType = "document";
xhr.send();

var applyFooter = function() {
  while (footerContents.childNodes.length > 0) {
    document.body.appendChild(footerContents.childNodes[0]);
  }
  if (window.encrypted_channel_id) {
    var viewCodeLink = document.getElementById("pagefooter_view_code");
    viewCodeLink.href =
      viewCodeLink.href + "/" + window.encrypted_channel_id + "/view";
    var abuseLink = document.getElementById("pagefooter_report_abuse");
    abuseLink.href =
      abuseLink.href + "?channelId=" + window.encrypted_channel_id;
  }
};
