---
title: App Lab Docs
---

[name]

## startWebRequest(url, function)

[/name]


[category]

Category: Data

[/category]

[description]

[short_description]

Request data from the internet and execute code when the request is complete.

[/short_description]

**Note:** This function should be used with the URL of web services that are designed to be called in that way.

The function passed to `startWebRequest` will be called with three parameters:

- The status of the request (completed or failed), using [HTTP status codes](http://www.w3schools.com/tags/ref_httpmessages.asp)
- The type of data returned by the service (text, image etc.)
- The data itself

[/description]

### Examples
____________________________________________________

[example]

This first example calls a service that provides weather information, and prints the response from the service to the debugging console.
<pre>
startWebRequest("http://api.openweathermap.org/data/2.5/weather?q=Seattle,us", function(status, type, content) {
  console.log(status); //In most cases, a successful response is indicated by "200"
  console.log(type); //The type of content returned from this service is text/json
  console.log(content); //The content is a string of text in the JSON syntax
});
</pre>

[/example]

____________________________________________________

[example]

In this more advanced example, we read the response from the service and print the description of the weather in Seattle to the debugging console.

**Note:** In order to write code that reads the content of the response returned by the service, we need to know the format of the response. This will often be documented online by the service, in our case the [OpenWeatherMap project](http://openweathermap.org/weather-data). We will also need to use the [JSON.parse()](http://www.w3schools.com/js/js_json.asp) function, which can be used to transform the string of JSON into an object that we can use in our code.
<pre>
startWebRequest("http://api.openweathermap.org/data/2.5/weather?q=Seattle,us", function(status, type, content) {
  console.log(status); //Print the request status to the console
  //Make sure that the request was successful before we continue
  if(status == 200) { //Compare the status returned by the service to the value 200
    //Read the contents using the JSON language, and store it in the results variable
    var results = JSON.parse(content);
    //We know that the city name is stored in the "name" property of the results
    var cityName = results.name;
    //We know that the weather description is stored in the "weather" property of the results
    //That weather property is an array, so we look at the first element of the array
    //We then get the "description" property of that first element
    var weatherText = results.weather[0].description;
    //Finally, we print the results to the debugging console
    console.log("The current weather in " + cityName + " is " + weatherText + ".");
  } else { //If the request was unsuccessful, display an error message
    console.log("The weather service is not available!");
  }
});
</pre>

[/example]

____________________________________________________

[example]

Finally, we continue to use the weather service and add UI controls to our example so that it is possible to get the weather from any city typed in a text box.
<pre>
//Create a UI element with instructions
textLabel("instruction", "Type a city name (for instance 'Seattle, US')", "city");
//Create a text box where a city name can be typed
textInput("city", "");
//Create a text label where we can display the results
textLabel("output", "");
//Store the address of the service in the url variable
var url = "http://api.openweathermap.org/data/2.5/weather?q=";
//Setup an event listener for when the text box contents changed
//This will be triggered when a new city name is entered in the box
onEvent("city", "change", function() {
  //Create a request by combining the URL of the service with the city
  var request = url + getText("city");
  //Print the request variable in the debugging console to verify it is properly formed
  console.log(request);
  //Make the request to the service
  startWebRequest(request, function(status, type, content) {
    //Print the request status to the debugging console
    console.log(status);
    //Verify that the status is "200" using an if block
    if(status == 200) {
      //Read the contents using the JSON language, and store it in the results variable
      var results = JSON.parse(content);
      //Make sure that the service was able to find data for the city that was typed
      //This is important because anything can be typed in the box
      //We don't know for sure that results exist for what was typed
      if (results.cod == "200"){ //Note that the code used is the same as the HTTP status code
        //Get information from the results, as in the previous example
        var cityName = results.name;
        var weatherText = results.weather[0].description;
        //Display the results in the corresponding text label
        setText("output", "The current weather in " + cityName + " is " + weatherText + ".");
      } else { //If the service did not return the "200" code, display an error message
        setText("output", "The service did not return data - " + results.message);
      }
    } else { //If the request was unsuccessful, display an error message
      setText("output", "The weather service is not available!");
    }
  });
});
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
startWebRequest(url, function(status, type, content) {
  Code to execute
});
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| url | string | Yes | The web address of a service that returns data.  |
| function | function | Yes | A function to execute.  |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
