var footerContents;
var ready;
var onReadyStateChange = function (evt) {
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
xhr.onload = function () {
  if (xhr.status === 200) {
    footerContents = xhr.responseXML.body;
    if (footerContents && ready) {
      applyFooter();
    }
  }
};
xhr.responseType = "document";
xhr.send();

var alreadyUpdatedHref = function (link, encryptedChannelId) {
  // Check if the link exists, has a defined href, and already includes the encryptedChannelId
  return link && link.href && link.href.includes(encryptedChannelId);
};

var applyFooter = function () {
  while (footerContents.childNodes.length > 0) {
    document.body.appendChild(footerContents.childNodes[0]);
  }
  if (!window.encrypted_channel_id) {
    return;
  }

  var viewCodeLink = document.getElementById("pagefooter_view_code");
  if (!alreadyUpdatedHref(viewCodeLink, window.encrypted_channel_id)) {
    viewCodeLink.href =
      viewCodeLink.href + "/" + window.encrypted_channel_id + "/view";
  }

  var abuseLink = document.getElementById("pagefooter_report_abuse");
  if (!alreadyUpdatedHref(abuseLink, window.encrypted_channel_id)) {
    abuseLink.href =
      abuseLink.href + "?channelId=" + window.encrypted_channel_id;
  }
};
