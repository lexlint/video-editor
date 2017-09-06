
function initMsgCenter(){
    var msgCenter = document.getElementById("msg-center");
    if(msgCenter != undefined){
        msgCenter.addEventListener("uploadBGM",
            function (e){
                console.log(e.detail);
                chrome.runtime.sendMessage({cmd: "uploadBGM", param : e.detail},
                    function(response) {});
                var uploadStatus = document.getElementById("bgm-upload-status");
                if(uploadStatus != undefined){
                    uploadStatus.innerText = "(上传中)";
                }
            }
        );
    }
}

function initMusicCaptureUI() {
    var captureDetect = document.getElementById("chrome-extension-music-capture-detect");
    if(captureDetect != undefined){
        captureDetect.style = "visibility: hidden; height: 0;";
    }
    var captureContent = document.getElementById("chrome-extension-music-capture-content");
    if(captureContent != undefined){
        captureContent.style = "visibility: visible";
    }
}

initMsgCenter();
initMusicCaptureUI();
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        switch(request.type){
            case "music":{
                var url = request.url;
                var musicCapture = document.getElementById("music-capture");
                if(musicCapture != undefined){
                    //避免重入
                    if(musicCapture.src != url){
                        musicCapture.src = url;

                        var musicStatus = document.getElementById("music-status");
                        if(musicStatus != undefined){
                            musicStatus.innerText = "检测到音乐...";
                        }
                        var musicTip = document.getElementById("music-tip");
                        if(musicTip != undefined){
                            musicTip.innerText = url;
                        }
                    }
                }
                break;
            }

            case "upload-response":{
                console.log(request.response);
                var uploadStatus = document.getElementById("bgm-upload-status");
                if(uploadStatus != undefined){
                    uploadStatus.innerText = "(已上传)";
                    uploadStatus.title = request.response.returnName;
                }
                break;
            }
        }

        sendResponse({code: 0});
    }
);
