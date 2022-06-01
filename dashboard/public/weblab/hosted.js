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
xhr.open("GET", "/projects/weblab_footer");
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

/*
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

fetch('/weblab/footer2.html').then(response => response.text()).then(data => {
  footerContents = htmlToElement(data);
  if (footerContents) {
    applyFooter();
  }
});
*/
var applyFooter = function() {
  while (footerContents.childNodes.length > 0) {
    document.body.appendChild(footerContents.childNodes[0]);
  }
  if (window.encrypted_channel_id) {
    var link = document.getElementById("pagefooter_view_code");
    link.onclick = function() {
      window.location.href =
        link.href + "/" + window.encrypted_channel_id + "/view";
      return false;
    };
  }
};
