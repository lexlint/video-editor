function uploadBGM(e){
    console.log(e.detail);
    chrome.runtime.sendMessage({cmd: "uploadBGM", param : e.detail},
                               function(response) {});
    var uploadStatus = document.getElementById("bgm-upload-status");
    if(uploadStatus != undefined){
        uploadStatus.innerText = "(上传中)";
    }
}

function initMsgCenter(){
    var msgCenter = document.getElementById("msg-center");
    if(msgCenter != undefined){
        msgCenter.addEventListener("uploadBGM", uploadBGM);
    }
}

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

function onMessage(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    switch(request.type){
        case "music":{
            setCaptureMusic(request.url);
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

initMsgCenter();
chrome.runtime.onMessage.addListener(onMessage);
