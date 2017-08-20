window.onload = function () {
    $( "#tools-tabs" ).tabs();
    initVideoPlayer();
    initEmojiList();
};

var emojiList = [
    //{id:"zm", file:"zm.png", animate:false},
];

var effectList = [
    //{type:"txt", text:"你好！", begin:10, end:20},
    //{type:"img", file:"cy.png", begin:10, end:20},
];

var defaultVideo = "../video/lol3.mp4";

Date.prototype.Format = function (fmt) {
    var o = {
        "h+": this.getUTCHours(),                   //小时
        "m+": this.getUTCMinutes(),                 //分
        "s+": this.getUTCSeconds(),                 //秒
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

function initEmojiList(){
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "./get-emoji.php", true);
    oReq.onreadystatechange = function (oEvent) {
        if (oReq.readyState === 4) {
            if (oReq.status === 200) {
                emojiList = JSON.parse(oReq.responseText);
                
                var content = "";
                for (var i = 0; i < emojiList.length; i ++){
                    content += "<img id='" + emojiList[i].id +"' class='emoji' src='emoji/" + emojiList[i].file +"' draggable='true' ondragstart='drag(event)'></img>"
                }
                document.getElementById("emojiList").innerHTML += content;
            } else {
                console.log("Error", oReq.statusText);
            }
        }
    };
    oReq.send(null);
}

function initVideoPlayer(){
    var video = document.getElementById("video-previewer");
    
    var file = getQueryString("file");
    video.src = file?file:defaultVideo;
    
    video.muted = false;
    video.volume = 1.0;
    
    video.ontimeupdate = function (){onVideoTimeUpdate();};
    video.onloadedmetadata = function (){onVideoMetadata();};
    video.onplaying = function(){onVideoPlaying();};
    video.onpause = function(){onVideoPause();};
    video.onseeking = function(){onVideoSeeking();};
    video.onseeked = function(){onVideoSeeked();};
    video.onvolumechange = function(){onVideoVolumechange();};
}

var lastChangeTime = 0;
function onVideoTimeUpdate(){
    var currentTime = $( "#video-previewer" )[0].currentTime;
    if(Math.abs(currentTime - lastChangeTime) > 0.2) {
        lastChangeTime = currentTime;
        refreshEffect();
    }
}

function onVideoMetadata(){
    $("#effect-previewer")[0].style.width = toPercent(($( "#video-previewer" )[0].videoWidth / $( "#video-previewer" )[0].videoHeight)/(16/9));
}

function onVideoPlaying(){
    var bgm = $("#bgm")[0];
    if(bgm.readyState != 0){
        bgm.play();
    }
}

function onVideoPause(){
    var bgm = $("#bgm")[0];
    if(bgm.readyState != 0){
        bgm.pause();
    }
}

function onVideoSeeking(){
    var bgm = $("#bgm")[0];
    if(bgm.readyState != 0){
        bgm.pause();
    }
}

function onVideoSeeked(){
    var bgm = $("#bgm")[0];
    if(bgm.readyState != 0){
        var video = $("#video-previewer")[0];
        bgm.currentTime = video.currentTime % bgm.duration;
    }
}

function onVideoVolumechange(){
    setBGMVolume();
}

function setBGMVolume(){
    var bgm = $("#bgm")[0];
    if(bgm.readyState != 0){
        var video = $("#video-previewer")[0];
        var percent = $("#bgm-volume")[0].valueAsNumber / 100;
        bgm.volume = video.volume * percent;
    }
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

function allowDrop(ev){
    ev.preventDefault();
}

function drag(ev){
    ev.dataTransfer.setData("emoji", JSON.stringify($.grep(emojiList, function(e){ return e.id == ev.target.id; })[0]));
}

function refreshEffect(){
    var currentTime = $( "#video-previewer" )[0].currentTime;
    for(var index = 0; index < effectList.length; index ++){
        if(effectList[index].begin > currentTime || effectList[index].end < currentTime){
            $("#effect"+ index)[0].style.visibility = "hidden";
        }
        else{
            $("#effect"+ index)[0].style.visibility = "visible";
        }
    }
}

function refreshHandler(){
    for (var i=0;i<effectList.length;i++)
    {
        $("#effect"+ i).resizable({
                                  aspectRatio: effectList[i].type == "img" ? true : false//开启按比例缩放，也可以指定比例： 16 / 9
                                  });
        $("#effect"+ i).dragging({
                                 move: 'both',
                                 randomPosition: false,
                                 hander: '.hander'
                                 });
        
        $( "#slider-range-" + i ).slider({
                                        range: true,
                                        min: 0,
                                        max: $( "#video-previewer" )[0].duration,
                                        values: [ effectList[i].begin, effectList[i].end ],
                                        slide: function( event, ui ) {
                                            var sliderID = ui.handle.parentNode.id;
                                            var index = parseInt(sliderID.substr(sliderID.lastIndexOf("-") + 1));
                                            effectList[index].begin = ui.values[0];
                                            effectList[index].end = ui.values[1];
                                            $( "#amount-" + index).val( new Date(ui.values[0]*1000).Format("hh:mm:ss") + " - " + new Date(ui.values[1]*1000).Format("hh:mm:ss") );
                                            refreshEffect();
                                            }
                                        });
        $( "#amount-" + i ).val( new Date(effectList[i].begin*1000).Format("hh:mm:ss") + " - " + new Date(effectList[i].end*1000).Format("hh:mm:ss") );
    }
}

function drop(ev){
    ev.preventDefault();
    var numEffect = effectList.length;
    var emoji = JSON.parse(ev.dataTransfer.getData("emoji"));
    effectList[numEffect] = {
        type: "img",
        file: emoji.file,
        begin: $( "#video-previewer" )[0].currentTime,
        end: $( "#video-previewer" )[0].duration,
        animate: emoji.animate
    };
    
    var effectID = "effect" + numEffect;
    var newEffect = "<div id=\"";
    newEffect += effectID;
    newEffect += "\" class=\"ui-widget-content\" ><i class='hander'></i><img width=100% height=100% src=\"emoji/";
    newEffect += emoji.file;
    newEffect += "\"></div>";
    
    $( "#effect-previewer" )[0].innerHTML += newEffect;
    
    $("#" + effectID).css({
                          position: 'absolute',
                          top: ev.offsetY,
                          left: ev.offsetX
                          });
    
    var newEffectController = "<li id =\"effectController";
    newEffectController += numEffect;
    newEffectController += "\" class=\"effectController\"><label>时间范围：</label><input type=\"text\" style=\"border:0; color:#f6931f; font-weight:bold; \" id=\"amount-";
    newEffectController += numEffect;
    newEffectController += "\"><img class=\"effect\" src=\"emoji/";
    newEffectController += emoji.file;
    newEffectController += "\"/><div class=\"slider-range\" id=\"slider-range-";
    newEffectController += numEffect;
    newEffectController += "\" ></div></li>";
    
    var effectControllerContainer = document.getElementById("effectList");
    effectControllerContainer.innerHTML += newEffectController;

    refreshHandler();
}

function addText(){
    var inputText = document.getElementById("inputText");
    var numEffect = effectList.length;
    effectList[numEffect] = {
        type: "txt",
        text: inputText.value,
        begin: $("#video-previewer")[0].currentTime,
        end: $("#video-previewer")[0].duration
    };
    var effectID = "effect" + numEffect;
    var newEffect = "<div id=\"";
    newEffect += effectID;
    newEffect += "\" class=\"ui-widget-content \" style=\"padding: 10px\"><i class='hander'></i><span class=\"overlay-text\" font-size=100% >";
    newEffect += inputText.value;
    newEffect += "</span></div>";
    
    $( "#effect-previewer" )[0].innerHTML += newEffect;
    
    $("#" + effectID).css({
                          position: 'absolute',
                          top: $( "#effect-previewer" )[0].clientHeight / 2,
                          left: $( "#effect-previewer" )[0].clientWidth / 2
                          });
    
    var newEffectController = "<li id =\"effectController";
    newEffectController += numEffect;
    newEffectController += "\"><label>时间范围：</label><input type=\"text\" style=\"border:0; color:#f6931f; font-weight:bold; \" id=\"amount-";
    newEffectController += numEffect;
    newEffectController += "\"/><label>";
    newEffectController += inputText.value;
    newEffectController += "</label><div class=\"slider-range\" id=\"slider-range-";
    newEffectController += numEffect;
    newEffectController += "\" ></div></li>";
    
    var effectControllerContainer = document.getElementById("effectList");
    effectControllerContainer.innerHTML += newEffectController;

    inputText.value = "";
    refreshHandler();
}

function doEdit(){
    var scale =  $( "#video-previewer" )[0].videoHeight/$( "#video-previewer" )[0].clientHeight;
    for(var index=0; index<effectList.length; index++){
        effectList[index].top = $("#effect" + index)[0].offsetTop * scale;
        effectList[index].left = $("#effect" + index)[0].offsetLeft * scale;
        effectList[index].width = $("#effect" + index)[0].clientWidth * scale;
        effectList[index].height = $("#effect" + index)[0].clientHeight * scale;
        effectList[index].zorder = $("#effect" + index)[0].style.zIndex;
    }
    
    var file = getQueryString("file");
    effectList.push({type:"mov", file:file?file:defaultVideo});
    
    var script = JSON.stringify(effectList);
    var jumpUrl = "edit.php?script=" + script;
    window.location.href = jumpUrl;
}

function toPercent(data){
    var strData = parseFloat(data)*100;
    var ret = strData.toString()+"%";
    return ret;
}

function setBGM(){
    var musicCapture = document.getElementById("music-capture");
    var bgm = document.getElementById("bgm");
    if(musicCapture && bgm){
        if(musicCapture.src === ""){
            alert("没有检测到音乐！");
        }
        else if(bgm.src === musicCapture.src){
            alert("已经设置过了！");
        }
        else{
            bgm.src = musicCapture.src;
            var bgmStatus = document.getElementById("bgm-status");
            var bgmTip = document.getElementById("bgm-tip");
            bgmStatus.innerText = "已设置";
            bgmTip.innerText = musicCapture.src;
            alert("设置成功！");
        }
    }
}

function resetBGM(){
    var bgm = document.getElementById("bgm");
    var bgmStatus = document.getElementById("bgm-status");
    var bgmTip = document.getElementById("bgm-tip");
    bgm.src = "";
    bgmStatus.innerText = "无";
    bgmTip.innerText = "";
   
}

function searchBMG(id){
    var searchEngine = [
                        {id:"search-qq",    url:"https://y.qq.com/portal/search.html#w="},
                        {id:"search-xiami", url:"http://www.xiami.com/search?key="},
                        {id:"search-163",   url:"https://music.163.com/#/search/m/?s="}
                     ];
    
    var searchUrl = $.grep(searchEngine, function(e){ return e.id == id; })[0].url + $("#search-key")[0].value;
    window.open(searchUrl);
}
