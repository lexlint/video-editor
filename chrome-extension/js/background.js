chrome.webRequest.onBeforeRequest.addListener(// callback
                                              function(info) {
                                                console.log("music intercepted: " + info.url);
                                                chrome.tabs.query({},function(tabs) {
                                                                  for (var i=0; i<tabs.length; ++i) {
                                                                  chrome.tabs.sendMessage(tabs[i].id, {type: "music", url:info.url}, function(response) {});
                                                                  };
                                                                  });
                                              },
                                              
                                              // filter
                                              {
                                              urls: ["*://*/*.mp3*", "*://*/*.m4a*"] ,types: ["media"]
                                              },
                                              
                                              // opt_extraInfoSpec
                                              []);
