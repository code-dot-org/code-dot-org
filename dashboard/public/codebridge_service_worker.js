let data = {};
self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("I Be installed and skipped?");
});

self.addEventListener("activate", (event) => {
  self.addEventListener("message", (event) => {
    console.log("GOT MESSAGE : ", event);
    data = event.data;
  });
});

const getMimeType = (language) => {
  if (language === "html") {
    return "text/html";
  } else if (language === "css") {
    return "text/css";
  } else {
    return undefined;
  }
};

self.addEventListener("fetch", (event) => {
  //console.log("I BE FETCHING-", event.request.url, event.request);
  console.log("AEL : ", event.request.url, data);
  Object.entries(data).forEach(([path, file]) => {
    if (event.request.url.match(path)) {
      console.log("MATCHES : ", event.request.url, path);
      const mimeType = getMimeType(file.language);
      if (mimeType) {
        event.respondWith(
          new Response(file.contents, {
            headers: { "Content-type": mimeType },
          })
        );
      }
    }
  });
});
