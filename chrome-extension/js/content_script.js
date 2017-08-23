
function setCaptureMusic(url){
    var musicCapture = document.getElementById("music-capture");
    if(musicCapture){
        //避免重入
        if(musicCapture.src != url){
            musicCapture.src = url;

            var musicStatus = document.getElementById("music-status");
            if(musicStatus){
                musicStatus.innerText = "检测到音乐...";
            }
            var musicTip = document.getElementById("music-tip");
            if(musicTip){
                musicTip.innerText = url;
            }
        }
    }
}

chrome.runtime.onMessage.addListener(
                                     function(request, sender, sendResponse) {
                                     console.log(sender.tab ?
                                                 "from a content script:" + sender.tab.url :
                                                 "from the extension");
                                     if (request.type == "music"){
                                        setCaptureMusic(request.url);
                                        console.log(request.url);
                                     }
                                     sendResponse({code: 0});
                                     });

function initMsgCenter(){
    var msgCenter = document.getElementById("msg-center");
    if(msgCenter != undefined){
        msgCenter.addEventListener("uploadBGM", function(e) {
                                   console.log(e.detail);
                                   chrome.runtime.sendMessage({cmd: "uploadBGM", param : e.detail}, function(response) {
                                                              //console.log(response.farewell);
                                                              });
                                   });
    }
}

initMsgCenter();
