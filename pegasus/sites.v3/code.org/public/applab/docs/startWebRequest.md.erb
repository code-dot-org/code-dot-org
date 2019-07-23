---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## startWebRequest(url, callback)

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Requests data from the internet and executes code when the request is complete.

[/short_description]

Your apps are not limited to data they collect and generate. Many web sites make data available for your apps to access. *startWebRequest()* should be used with the URL of web services that are designed to be called in that way.

The callback function will be passed three parameters:
- The status of the request (completed or failed), using [HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes).
- The type of data returned by the service (text, image etc.).
- The data itself in JSON format.

[/description]

### Examples
____________________________________________________

[example]

```
var query = encodeURI('select * from weather.forecast where location="98101"');
var url = "https://query.yahooapis.com/v1/public/yql?q=" + query+"&format=json"; 
startWebRequest(url, function(status, type, content) {
  console.log(status);
  console.log(type);
  console.log(content);
});
```

[/example]

____________________________________________________

[example]

**Example: Wind Speed and Wind Chill** Read the response from the service and print the description of the wind in Seattle to the debugging console.

```
// Read the response from the service and print the description of the wind in Seattle to the debugging console.
var query = encodeURI('select wind from weather.forecast where location="98101"');
var url = "https://query.yahooapis.com/v1/public/yql?q=" + query+"&format=json"; 
startWebRequest(url, function(status, type, content) {
  if(status == 200) {
    var contentJson = JSON.parse(content);
    var chill = contentJson.query.results.channel.wind.chill;
    var direction = contentJson.query.results.channel.wind.direction;
    var speed = contentJson.query.results.channel.wind.speed;
    console.log("The current wind chill in Seattle is " + chill + " and caused by a " + speed + "mph wind from " + direction + " degrees direction.");
  } else {
    console.log("The weather service is not available!");
  }
});
```

[/example]

____________________________________________________

[example]

Finally, we continue to use the weather service and add UI controls to our example so that it is possible to get the weather from any city typed in a text box.

```
textLabel("instruction", "Type a zip code:");
textInput("zip", "");
textLabel("output", "");

onEvent("zip", "change", function() {
  var query = encodeURI('select astronomy from weather.forecast where location="' + getText("zip") +'"');
  var url = "https://query.yahooapis.com/v1/public/yql?q=" + query+"&format=json"; 
  startWebRequest(url, function(status, type, content) {
    if(status == 200) {
      var contentJson = JSON.parse(content);
      var sunrise = contentJson.query.results.channel.astronomy.sunrise;
      var sunset = contentJson.query.results.channel.astronomy.sunset;
      setText("output", "Zip Code:" + getText("zip") + " Sunrise:" + sunrise + " Sunset:" + sunset);      
    } else {
      setText("output", "The weather service is not available!");      
    }
  });
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
startWebRequest(url, function(status, type, content) {
  Code to execute
});
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| url | string | Yes | The web address of a service that returns data.  |
| callback | function | Yes | A function that is asynchronously called when the call to startWebRequest() is finished. Three paramters are passed to this function.  |

[/parameters]

[returns]

### Returns
When startWebRequest() is finished executing, the callback function is automatically called.

[/returns]

[tips]

### Tips
- startWebRequest() has a callback because it is accessing an external web service and therefore will not finish immediately.
- The callback function can be inline, or separately defined in your app and called from startWebRequest().
- Do not put functions inside a loop that contain asynchronous code, like startWebRequest(). The loop will not wait for the callback function to complete.
- In order to write code that reads the content of the response returned by the service, we need to know the format of the response. This will often be documented online by the service, in the above case [Yahoo Weather](https://developer.yahoo.com/weather/). 
- You will also need to use the [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) function, which can be used to transform the string of JSON into an object that we can use in our code.

[/tips]

### Allowed hostnames
- For security reasons, only URLs with certain hostnames can be accessed using startWebRequest. Currently, the hostname must end in one of the following:
  - accuweather.com
  - api.data.gov
  - api.randomuser.me
  - api.zippopotam.us
  - code.org
  - data.cityofchicago.org
  - googleapis.com
  - query.yahooapis.com
  - noaa.gov
  - rhcloud.com
  - wikipedia.org

Want to use a URL that's not currently allowed? Let us know at support@code.org.

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
