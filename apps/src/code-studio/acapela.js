import $ from 'jquery';

module.exports = {
  getAudio: function (text, voice, config, callback) {
    $.getJSON("http://vaas.acapela-group.com/Services/UrlMaker?jsoncallback=?", {
      cl_login: config.login,
      cl_app: config.app,
      cl_pwd: config.pwd,
      req_voice: voice,
      req_text: text
    }, callback);
  },

  populateVoicesList: function (target, config) {
    $.getJSON("http://vaas.acapela-group.com/Services/Voices.json?jsoncallback=?", {
      cl_login: config.login,
      cl_app: config.app,
      fields_selection: "language_desc;speaker",
      frequency: "22050",
      technology: "HQ",
    }, function (data) {
      var voices = Object.keys(data.voices).reduce(function (prev, curr) {
        var voice = {
          speaker: data.voices[curr].speaker,
          id: curr
        };
        if (prev[data.voices[curr].language_desc]) {
          prev[data.voices[curr].language_desc].push(voice);
        } else {
          prev[data.voices[curr].language_desc] = [voice];
        }
        return prev;
      }, {});

      var optgroups = Object.keys(voices).map(function (language) {
        var options = voices[language].map(function (voice) {
          return "<option value='" + voice.id + "'>" + voice.speaker + "</option>";
        });

        return "<optgroup label='" + language + "'>" + options.join('') + "</optgroup>";
      });

      target.html(optgroups.join(''));
      target.find('option[value="rosie22k"]').attr("selected",true);
    });
  }
};
