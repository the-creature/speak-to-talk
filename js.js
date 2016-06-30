var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

//get languages
$.get( "https://raw.githubusercontent.com/the-creature/language-json/master/data.json", function( data ) {  
  var cList = $('#language');
  var data = $.parseJSON(data);
  
  $.each(data, function(i) {
      var option = $('<option/>')
          .attr('value', data[i].code)
          .html(data[i].name)
          .appendTo(cList);
  });
});


// Speech Recognition
if (!('webkitSpeechRecognition' in window)) {
    message.innerHTML = 'Web Speech API is not supported by this browser. Upgrade to <a href="//www.google.com/chrome">Chrome</a> version 25 or later.';
} else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
        recognizing = true;
        message.innerHTML = 'Speak now.';
        talk_button.innerHTML = 'Listen';
    };

    recognition.onresult = function (event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_span.innerHTML = final_transcript;
        interim_span.innerHTML = interim_transcript;
    };

    recognition.onend = function () {

        recognizing = false;
        if (ignore_onend) {
            return;
        }
        speechMyText(final_transcript);
        if (!final_transcript) {
            message.innerHTML = 'Click "Talk" and begin speaking.';
            talk_button.innerHTML = 'Talk';
            return;
        }
    };

    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            message.innerHTML = 'No speech was detected.';
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            message.innerHTML = 'No microphone was found. Ensure that a microphone is installed.';
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                message.innerHTML = 'Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream';
            } else {
                message.innerHTML = 'Permission to use microphone was denied.';
            }
            ignore_onend = true;
        }
    };

}

function talkWithApp(event) {
    if (recognizing) {
        recognition.stop();
        message.innerHTML = 'Click "Talk" and begin speaking.';
        talk_button.innerHTML = 'Talk';
        return;
    }
    final_transcript = '';
    recognition.lang = language.value;
    recognition.start();
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    message.innerHTML = 'Click the "Allow" button above to enable your microphone.';
    start_timestamp = event.timeStamp;
}

// Speech Synthesis
function speechMyText(textToSpeech) {
    var u = new SpeechSynthesisUtterance();
    u.text = textToSpeech;
    u.lang = language.value;
    u.rate = 1.0;
    u.onend = function (event) {}
    speechSynthesis.speak(u);
}


