var colorPicker;
window.onload = function () {
    $( "#tools-tabs" ).tabs();
    initVideoPlayer();
    initEmojiList();
    initFontList();
    colorPicker = ColorPicker(document.getElementById('color-picker'),
        function(hex, hsv, rgb) {
            document.getElementById("inputText").style.color = hex;
        });
    colorPicker.setHex("#000000");
    setFontSize(document.getElementById("font-size").value);
    initExtensionMsgCenter();
};

var emojiList = [
    //{id:"zm", file:"zm.png", animate:false},
];

var effectList = [
    //{type:"txt", text:"你好！", begin:10, end:20},
    //{type:"img", file:"cy.png", begin:10, end:20},
];

var fontList = [
    //{name:"宋体", fontMac:"STSong",       fontWindows:"SimSun",           file:"Songti.ttc"},
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

function validataOS(){
    if(navigator.userAgent.indexOf("Window")>0){
        return "Windows";
    }else if(navigator.userAgent.indexOf("Mac OS X")>0) {
        return "Mac";
    }else if(navigator.userAgent.indexOf("Linux")>0) {
        return "Linux";
    }else{
        return "NUll";
    }
}

function colorRgb2Hex(value) {
    var color = value.replace(/[^\d,]/g, "").replace(/(\d+)/g, function(s, s1) {
        var v = parseInt(s1).toString(16);
        return v.length == 1 ? "0"+v : v;
    });
    return "#"+color.replace(/,/g, "").toUpperCase();
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

function initFontList(){
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "../fonts/fonts.json", true);
    oReq.onreadystatechange = function (oEvent) {
        if (oReq.readyState === 4) {
            if (oReq.status === 200) {
                fontList = JSON.parse(oReq.responseText);
                for(var index=0; index < fontList.length; index ++){
                    if(((validataOS() == "Mac")?fontList[index].fontMac:fontWindows) != ""){
                        var font = document.createElement('option');
                        font.text = fontList[index].name;
                        document.getElementById("font-selector").add(font);
                    }
                }
                selelctFont(document.getElementById("font-selector").value);
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
    if(Math.abs(currentTime - lastChangeTime) > 0.1) {
        lastChangeTime = currentTime;
        refreshEffect();
        refreshTimeline();
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
    refreshTimeline();
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

function refreshTimeline() {
    $("#timeline")[0].style.left = $( "#video-previewer" )[0].currentTime / $( "#video-previewer" )[0].duration * $("#effectList-container")[0].clientWidth + "px";
}

function refreshEffect(){
    var currentTime = $( "#video-previewer" )[0].currentTime;
    for(var index = 0; index < effectList.length; index ++){
        if(effectList[index].begin > currentTime || effectList[index].end < currentTime || effectList[index].valid == false){
            $("#effect"+ index)[0].style.visibility = "hidden";
        }
        else{
            $("#effect"+ index)[0].style.visibility = "visible";
        }
    }
}

function selectEffect(id) {
    $("#effect-previewer").children().css({"zIndex":"0", "border":"1px solid rgba(220,220,220,0)"});
    $("#effectList").children().css({"zIndex":"0", "background":"#666"});
    if(id === -1){
        return;
    }
    $("#effect"+ id).css({"zIndex":"0", "border":"1px solid rgba(220,220,220,1)"});
    $("#effectController"+ id).css({"zIndex":"0", "background":"rgb(217, 232, 219)"});

    var scrollTop = $("#effectController"+ id)[0].offsetTop -  $("#effectList-container")[0].scrollTop;
    if (scrollTop < 0){
        $("#effectList-container")[0].scrollTop += scrollTop;
    }

    var scrollButtom = ($("#effectController"+ id)[0].offsetTop + $("#effectController"+ id)[0].offsetHeight) - ($("#effectList-container")[0].offsetHeight)  -  $("#effectList-container")[0].scrollTop;
    if (scrollButtom > 0){
        $("#effectList-container")[0].scrollTop += scrollButtom;
    }
}

function refreshHandler(){
    for (var i=0;i<effectList.length;i++)
    {
        if(effectList[i].valid == true){
            if(effectList[i].type == "img"){
                $("#effect"+ i).resizable({aspectRatio: true});
            }
            $("#effect"+ i).dragging({
                move: 'both',
                hander: '.hander'
            });

            $( "#slider-range-" + i ).slider({
                range: true,
                min: 0,
                max: $( "#video-previewer" )[0].duration*1000,
                values: [ effectList[i].begin*1000, effectList[i].end*1000 ],
                slide: function( event, ui ) {
                    var sliderID = ui.handle.parentNode.id;
                    var index = parseInt(sliderID.substr(sliderID.lastIndexOf("-") + 1));
                    effectList[index].begin = ui.values[0]/1000;
                    effectList[index].end = ui.values[1]/1000;
                    $( "#amount-" + index).val( new Date(ui.values[0]).Format("hh:mm:ss") + " - " + new Date(ui.values[1]).Format("hh:mm:ss") );
                    refreshEffect();
                    selectEffect(index);
                }
            });
            $( "#amount-" + i ).val( new Date(effectList[i].begin).Format("hh:mm:ss") + " - " + new Date(effectList[i].end).Format("hh:mm:ss") );
            $("#effectController" + i)[0].onclick = function (e) {
                var index = parseInt(e.currentTarget.id.replace("effectController", ""));
                selectEffect(index);
            };
        }
    }
    $("#effect-previewer").mousedown(function(e) {
        selectEffect(-1);
    });
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
        animate: emoji.animate,
        valid:true
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
    newEffectController += "\" class=\"effectController\"><button onclick=\"deleteEffect(this.parentElement.id)\">删除</button><label>时间范围：</label><input type=\"text\" class=\"timespan\" id=\"amount-";
    newEffectController += numEffect;
    newEffectController += "\"><img class=\"effect\" src=\"emoji/";
    newEffectController += emoji.file;
    newEffectController += "\"/><div class=\"slider-range\" id=\"slider-range-";
    newEffectController += numEffect;
    newEffectController += "\" ></div></li>";

    var effectControllerContainer = document.getElementById("effectList");
    effectControllerContainer.innerHTML += newEffectController;

    refreshHandler();
    selectEffect(numEffect);
}

function addText(){
    var inputText = document.getElementById("inputText");
    if(inputText.value.trim() == ""){
        alert("请输入文字！");
        return;
    }
    var numEffect = effectList.length;
    effectList[numEffect] = {
        type: "txt",
        text: inputText.value,
        begin: $("#video-previewer")[0].currentTime,
        end: $("#video-previewer")[0].duration,
        family: inputText.style.fontFamily,
        size: inputText.style.fontSize.substr(0, inputText.style.fontSize.length - 2),
        color: colorRgb2Hex(inputText.style.color),
        valid:true
    };
    var effectID = "effect" + numEffect;
    var newEffect = "<div id=\"";
    newEffect += effectID;
    newEffect += "\" class=\"ui-widget-content \" style=\"padding: 10px\"><i class='hander'></i><span class=\"overlay-text\" style=\"font-family:"
    newEffect += inputText.style.fontFamily;
    newEffect += "; color:";
    newEffect += inputText.style.color;
    newEffect += "; font-size:";
    newEffect += inputText.style.fontSize;
    newEffect += "\" >";
    newEffect += ("<p class=\"overlay-text\">" + inputText.value.replace(/\n/g, "</p><p class=\"overlay-text\">") + "</p>");
    newEffect += "</span></div>";

    $( "#effect-previewer" )[0].innerHTML += newEffect;

    $("#" + effectID).css({
        position: 'absolute',
        top: 0,
        left: 0
    });

    var newEffectController = "<li id =\"effectController";
    newEffectController += numEffect;
    newEffectController += "\"><button onclick=\"deleteEffect(this.parentElement.id)\">删除</button><label>时间范围：</label><input type=\"text\" class=\"timespan\" id=\"amount-";
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
    selectEffect(numEffect);
}

function deleteEffect(id){
    var index = parseInt(id.replace("effectController", ""));
    effectList[index].valid = false;
    $("#effectController" + index)[0].style.visibility = "hidden";
    $("#effectController" + index)[0].style.height = 0;
    $("#effect" + index)[0].style.visibility = "hidden";
}

function doEdit(){
    var scale =  $( "#video-previewer" )[0].videoHeight/$( "#video-previewer" )[0].clientHeight;
    var tmpEffectList = [];
    for(var index=0; index<effectList.length; index++){
        if(effectList[index].valid == true){
            effectList[index].top = $("#effect" + index)[0].offsetTop * scale;
            effectList[index].left = $("#effect" + index)[0].offsetLeft * scale;
            effectList[index].width = $("#effect" + index)[0].clientWidth * scale;
            effectList[index].height = $("#effect" + index)[0].clientHeight * scale;
            effectList[index].zorder = $("#effect" + index)[0].style.zIndex;
            if(effectList[index].size != undefined){
                effectList[index].size = effectList[index].size * scale;
            }
            tmpEffectList.push(effectList[index]);
        }
    }

    var uploadStatus = document.getElementById("bgm-upload-status");
    if(uploadStatus.title != ""){
        tmpEffectList.push({type:"bgm", file:uploadStatus.title, volume:$("#bgm-volume")[0].valueAsNumber});
    }

    if(tmpEffectList.length == 0){
        alert("没有添加任何特效！");
        return;
    }

    var file = getQueryString("file");
    tmpEffectList.push({type:"mov", file:file?file:defaultVideo});

    var script = JSON.stringify(tmpEffectList);
    var jumpUrl = "edit.php?script=" + btoa(encodeURIComponent(script));
    window.location.href = jumpUrl;
}

function toPercent(data){
    var strData = parseFloat(data)*100;
    var ret = strData.toString()+"%";
    return ret;
}

function initExtensionMsgCenter(){
    var msgCenter = document.createElement("div");
    msgCenter.id = "msg-center";
    document.body.insertBefore(msgCenter, document.body.childNodes[0]);
}

function fireExtensionMsg(event, param){
    var msgEvent = new CustomEvent(event, {"detail" : param});

    msgCenter = document.getElementById("msg-center");
    msgCenter.dispatchEvent(msgEvent);
}

var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

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

            var src = getLocation(musicCapture.src);
            var name = src.pathname.substr(src.pathname.lastIndexOf("/") + 1);
            fireExtensionMsg("uploadBGM", {"url" : this.location.origin + this.location.pathname.substr(0, this.location.pathname.lastIndexOf("/") + 1) + "upload.php", "src" : musicCapture.src, "name" : name});
            alert("设置成功！");
        }
    }
}

function resetBGM(){
    var bgm = document.getElementById("bgm");
    var bgmStatus = document.getElementById("bgm-status");
    var bgmTip = document.getElementById("bgm-tip");
    var uploadStatus = document.getElementById("bgm-upload-status");
    bgm.src = "";
    bgmStatus.innerText = "无";
    bgmTip.innerText = "";
    uploadStatus.innerText = "";
    uploadStatus.title = "";
}

function searchBMG(id){
    var key = $("#search-key")[0].value;
    if (key.length == 0){
        alert("请输入关键词！");
        return ;
    }
    var searchEngine = [
        {id:"search-qq",    url:"https://y.qq.com/portal/search.html#w="},
        {id:"search-xiami", url:"http://www.xiami.com/search?key="},
        {id:"search-163",   url:"https://music.163.com/#/search/m/?s="}
    ];

    var searchUrl = $.grep(searchEngine, function(e){ return e.id == id; })[0].url + key;
    window.open(searchUrl);
}

function selelctFont(font){
    var fontSet = $.grep(fontList, function(e){ return e.name == font; })[0];
    document.getElementById("inputText").style.fontFamily = (validataOS() == "Mac")?fontSet.fontMac:fontSet.fontWindows;
}

function setFontSize(size){
    document.getElementById("inputText").style.fontSize = size + "px";
}

function searchKeyChange(event){
    if(event.key == 'Enter'){
        searchBMG("search-xiami");
    }
}
