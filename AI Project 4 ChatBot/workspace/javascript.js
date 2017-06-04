//code.stephenmorley.org
function Queue(){var a=[],b=0;this.getLength=function(){return a.length-b};this.isEmpty=function(){return 0==a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!=a.length){var c=a[b];2*++b>=a.length&&(a=a.slice(b),b=0);return c}};this.peek=function(){return 0<a.length?a[b]:void 0}};
window.onload = function(e){ 
    //Start Yandex Translator           
    var YandexTranslator = (function() {
        YANDEX_TRANSLATE_API_KEY="trnsl.1.1.20170429T001604Z.c13a54c03a9f737f.c1e70eefe776692ae1e2c687b7f726cef76219e5";
        return {
            translate: function(text, from, to, successCallback) {
                if ('undefined' === typeof YANDEX_TRANSLATE_API_KEY || '' === YANDEX_TRANSLATE_API_KEY) {
                    console.log('Non empty "YANDEX_TRANSLATE_API_KEY" variable must be defined, skip translating.');

                    successCallback(text);

                    return;
                }

                var lang = from + '-' + to;
                var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=' + YANDEX_TRANSLATE_API_KEY + '&text=' + text + '&lang=' + lang;

                $.ajax({
                    url: url
                }).done(function(response) {
                    if (200 !== response.code) {
                        console.log(response);

                        return;
                    }

                    successCallback(response.text[0]);
                });
            }
        };
    })();
    //End Yandex Translator
    
    SDK.applicationId = "238109865399829413"; //"2033702290708399205"
    var sdk = new SDKConnection();
    var web = new WebAvatar();
        web.connection = sdk;
        web.avatar = "11557990";
        web.voice = "";
        web.voiceMod = "";
        web.width = "300";
        web.height = "360";
        web.createBox();
    var textfield = $(".textfield");
    var gaze = $(".gazelegend");
        gaze.addClass("fixated");
    translated_text="";
    web.message("", "", "NOD", "");
    web.processMessages();
    //Allow Enter to be used to 
    textfield.keyup(function(event){
        if(event.keyCode == 13){
            $(".button").click();
        }
    });
    var messagequeue = new Queue();
    
    $(".button").click(function() {
        raw_text = textfield.val();
        language_details=$("#language").val().split(",");
        web.voice = language_details[0];
        language = language_details[1];
        
        //Translate the text
        YandexTranslator.translate(raw_text, 'en', language, function(translated_text) {
            paragraphs = translated_text.split(/[\n]+/);
            $(".translatedfield").val(paragraphs);
            console.log(paragraphs);
            
            //Parse sentence    
            //Paragraphs
            for (var i = 0; i < paragraphs.length; i++) {
                //Sentences
                sentences = paragraphs[i].split(/[.!?]+/);
                for (var j = 0; j < sentences.length; j++) {
                    //longer sentences -> split to words
                    if (sentences[j].length > 20) {
                        words = sentences[j].split(/[\s]+/);
                        var turnStart = "";
                        var turnMiddleA = "";
                        var turnMiddleB = "";
                        //Assign words to parts of the sentence
                        for (var k = 0; k < words.length; k++) {
                            if (k < Math.floor(words.length/2)) {
                                turnStart = turnStart.concat(words[k], " ");
                            }
                            else if (k < Math.floor(words.length*3/4)) {
                                turnMiddleA = turnMiddleA.concat(words[k], " ");
                            }
                            else {
                                turnMiddleB = turnMiddleB.concat(words[k], " ");
                            }
                        }
                        //Avert gaze
                        messagequeue.enqueue([turnStart, false, "Start of turn"]);
                        //Mostly avert gaze
                        var randomNum = Math.floor(Math.random() * 100);
                        if (randomNum >= 73) {
                            messagequeue.enqueue([turnMiddleA, true, "Middle of turn (a)"]);
                        }
                        else {
                            messagequeue.enqueue([turnMiddleA, false, "Middle of turn (a)"]);
                        }
                        //Mostly fixate gaze
                        randomNum = Math.floor(Math.random() * 100);
                        if (randomNum >= 70) {
                            messagequeue.enqueue([turnMiddleB, false, "Middle of turn (b)"]);
                        }
                        else {
                            messagequeue.enqueue([turnMiddleB, true, "Middle of turn (b)"]);
                        }
                    }
                    else {
                        messagequeue.enqueue([sentences[j], false, "Start of turn"]);
                    }
                }
                messagequeue.enqueue([sentences[j], true, "End of turn"]);
            }
    
            var processQueue = function() {
                if (messagequeue.getLength() > 0) {
                    var item = messagequeue.dequeue();
                    //fixated
                    if (item[1]) {
                        gaze.addClass("fixated");
                        web.message(item[0], "", "", "", processQueue);
                        $(".explanation").html("(" + item[2] + ")");
                    }
                    else {
                        gaze.removeClass("fixated");
                        web.message(item[0], "", "", "sleeping", processQueue);
                        $(".explanation").html("(" + item[2] + ")");
                    }
                }
            };
            processQueue();
        });
    });
};