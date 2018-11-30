import $ from 'jquery';

module.exports = {
  listenForGetAudio(config) {
    $('button.tts').click(function () {
      var sourceText;
      switch (this.id) {
        case 'tts-short-instructions':
          sourceText = $("#level_tts_short_instructions_override").val() || $("#level_short_instructions").val();
          break;
        case 'tts-long-instructions':
          sourceText = $("#level_tts_long_instructions_override").val() || $('#level_long_instructions_preview').text();
          break;
      }

      $.getJSON("https://vaas.acapela-group.com/Services/UrlMaker?jsoncallback=?", {
        cl_login: config.login,
        cl_app: config.app,
        cl_pwd: config.pwd,
        req_voice: $("#level_tts_voice").val(),
        req_text: sourceText
      }, function (data) {
        $('#tts-error').hide();

        if (data.err_msg) {
          $('#alert-content').text(unescape(data.err_msg));
          $('#tts-error').show();
        }

        if (data.snd_url) {
          $("#tts-audio").attr({
            src: data.snd_url,
            controls: 'controls'
          });
        }
      });
    });
  },

  populateVoicesList(config) {
    $.getJSON("https://vaas.acapela-group.com/Services/Voices.json?jsoncallback=?", {
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

      $('#level_tts_voice').html(optgroups.join(''));
      $('#level_tts_voice').find('option[value="sharon22k"]').attr("selected",true);
    });
  }
};
