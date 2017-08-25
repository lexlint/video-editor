
chrome.webRequest.onBeforeRequest.addListener(
    // callback
    function (info){
        console.log("music intercepted: " + info.url);
        chrome.tabs.query({},
            function(tabs) {
                for (var i=0; i<tabs.length; ++i) {
                    chrome.tabs.sendMessage(tabs[i].id, {type: "music", url:info.url}, function(response) {});
                };
            }
        );
    },
    // filter
    {
        urls: ["*://*/*.mp3*", "*://*/*.m4a*"] ,types: ["media"]
    },
    // opt_extraInfoSpec
    []);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if(request.cmd == "uploadBGM"){
            console.log(request.param);

            var url = request.param.url;
            var filename = request.param.name;
            var oReq = new XMLHttpRequest();
            oReq.open("GET", request.param.src, true);
            oReq.responseType = "blob";
            oReq.onreadystatechange = function (oEvent) {
                if (oReq.readyState === 4) {
                    if (oReq.status === 200) {

                        var formData = new FormData();

                        var blobs = new Blob([oReq.response], {type:oReq.response.type});
                        formData.append("file", blobs, filename);
                        formData.append("submit", "Submit");

                        var uploadRequest = new XMLHttpRequest();
                        uploadRequest.open("POST", url);
                        uploadRequest.onreadystatechange = function (oEvent) {
                            if (uploadRequest.readyState === 4) {
                                if (uploadRequest.status === 200) {
                                    var res = JSON.parse(uploadRequest.response);
                                    chrome.tabs.query({},
                                        function(tabs) {
                                            for (var i=0; i<tabs.length; ++i) {
                                                chrome.tabs.sendMessage(tabs[i].id, {type: "upload-response", response:res}, function(response) {});
                                            };
                                        }
                                    );

                                }else {
                                    console.log("Error", uploadRequest.statusText);
                                }
                            }
                        }

                        uploadRequest.send(formData);
                    } else {
                        console.log("Error", oReq.statusText);
                    }
                }
            };
            oReq.send(null);
        }
    }
);
