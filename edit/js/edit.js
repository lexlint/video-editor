var emojiList = [
                 {id:"zm", file:"zm.png", animate:false},
                 {id:"wx", file:"wx.png", animate:false},
                 {id:"ll", file:"ll.png", animate:false},
                 {id:"kl", file:"kl.png", animate:false},
                 {id:"cy", file:"cy.png", animate:false},
                 {id:"tt", file:"tt.png", animate:true},
                 {id:"clock", file:"clock.png", animate:true}
];

var effectList = [
    //{type:"txt", text:"你好！", begin:10, end:20},
    //{type:"img", file:"cy.png", begin:10, end:20},
];

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
    var currentTime = $( "#previewer" )[0].currentTime;
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
                                        max: $( "#previewer" )[0].duration,
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
        begin: $( "#previewer" )[0].currentTime,
        end: $( "#previewer" )[0].duration,
        animate: emoji.animate
    };
    
    var effectID = "effect" + numEffect;
    var newEffect = "<div id=\"";
    newEffect += effectID;
    newEffect += "\" class=\"ui-widget-content\" ><i class='hander'></i><img width=100% height=100% src=\"emoji/";
    newEffect += emoji.file;
    newEffect += "\"></div>";
    
    var effectContainer = document.getElementById("effect-container");
    effectContainer.innerHTML += newEffect;
    
    $("#" + effectID).css({
                          position: 'absolute',
                          top: ev.offsetY,
                          left: ev.offsetX
                          });
    
    var newEffectController = "<li id =\"eddectController";
    newEffectController += numEffect;
    newEffectController += "\"><label>时间范围：</label><input type=\"text\" style=\"border:0; color:#f6931f; font-weight:bold; \" id=\"amount-";
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
        begin: $("#previewer")[0].currentTime,
        end: $("#previewer")[0].duration
    };
    var effectID = "effect" + numEffect;
    var newEffect = "<div id=\"";
    newEffect += effectID;
    newEffect += "\" class=\"ui-widget-content \" style=\"padding: 10px\"><i class='hander'></i><span class=\"overlay-text\" font-size=100% >";
    newEffect += inputText.value;
    newEffect += "</span></div>";
    
    var effectContainer = document.getElementById("effect-container");
    effectContainer.innerHTML += newEffect;
    
    $("#" + effectID).css({
                          position: 'absolute',
                          top: effectContainer.clientHeight / 2,
                          left: effectContainer.clientWidth / 2
                          });
    
    var newEffectController = "<li id =\"eddectController";
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
    var scale =  $( "#previewer" )[0].videoHeight/$( "#previewer" )[0].clientHeight;
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

var lastChangeTime = 0;
function onVideoTimeUpdate(){
    var currentTime = $( "#previewer" )[0].currentTime;
    if(Math.abs(currentTime - lastChangeTime) > 1) {
        lastChangeTime = currentTime;
        refreshEffect();
    }
}

function initEmojiList(){
    var content = "";
    for (var i = 0; i < emojiList.length; i ++){
        content += "<img id='" + emojiList[i].id +"' class='emoji' src='emoji/" + emojiList[i].file +"' draggable='true' ondragstart='drag(event)'></img>"
    }
    document.getElementById("emojiList").innerHTML += content;
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
