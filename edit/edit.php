<!-- lang: php -->

/*
input:
[
{"type":"img","file":"zm.png","begin":2.653972,"end":30.022,"animate":false,"top":35,"left":90,"width":60,"height":60,"zorder":"0"},
{"type":"img","file":"tt.png","begin":6.532061,"end":30.022,"animate":true,"top":144,"left":328,"width":112,"height":112,"zorder":"0"},
{"type":"img","file":"clock.png","begin":12.083265,"end":30.022,"animate":true,"top":344,"left":685,"width":109,"height":109,"zorder":"0"},
{"type":"txt","text":"ddas%20dqdada%20dadfqe%20夫妻档的的的%20%20丁大卫","begin":22,"end":30.022,"top":203,"left":471,"width":148,"height":110,"zorder":"1"},
{"type":"mov","file":"../video/lol3.mp4"}
]

output:
ffmpeg -i lol3.mp4 -ignore_loop 0 -i clock.png -ignore_loop 0 -i tt.gif -i numb.mp3 -filter_complex "\
[1:v]scale=150:150[src1];\
[2:v]scale=150:150[src2];\
[0:v][src1]overlay=x=10:y=10:enable='between(t,0,10):shortest=1'[dest1];\
[dest1][src2]overlay=x=120:y=120:enable='between(t,8,19):shortest=1'[dest2];\
[dest2] drawtext=fontfile=/Library/Fonts/Songti.ttc:text=你好，呵呵呵呵呵呵:fontcolor=red:fontsize=48:x=150:y=200:enable='between(t,7,15)'[dest3];\
[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.9[a0];\
[3:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.0[a3];\
[a0][a3]amix=inputs=2:duration=first[aout]\
" -map [dest3] -map [aout] out.mp4
*/

<?php
    parse_str(urldecode($_SERVER["QUERY_STRING"]));
    echo $script;

    $S=json_decode($script);
    print_r($S);
    
    function filter_img($var)
    {
        return($var->type == "img");
    }
    $imgs = array_filter($S,"filter_img");

    $img_input = "";
    $img_src = "";
    $img_overlay = "";
    $vcount = 0;
    foreach ($imgs as $img) {
        $vcount ++;
        if($img->animate == 1){
            $img_input .= " -ignore_loop 0";
        }
        $img_input .= " -i ./emoji/".$img->file;
        $img_src .= "[".$vcount.":v]scale=".($img->width).":".($img->height)."[src".$vcount."]; ";
        $img_overlay .= ($vcount==1?"[0:v]":"[dest".($vcount-1)."]")."[src".$vcount."]"."overlay=x=".($img->left).":y=".($img->top)
        .":enable='between(t,".($img->begin).",".($img->end).")".(($img->animate == 1)?":shortest=1":"")."'[dest".$vcount."];";
    }
    
    function filter_txt($var)
    {
        return($var->type == "txt");
    }
    $txts = array_filter($S,"filter_txt");
    $txt_overlay = "";
    
    foreach ($txts as $txt) {
        $vcount ++;
        $txt_overlay .= "[dest".($vcount-1)."] drawtext=fontfile=../fonts/Songti.ttc:text=".($txt->text).":fontcolor=red:fontsize=48:x=".($txt->left).":y=".($txt->top).":enable='between(t,".($txt->begin).",".($txt->end).")'[dest".$vcount."];";
    }
    
    $filter = substr_replace($img_src.$img_overlay.$txt_overlay, "\"", -1);

    $parts = parse_url($S[count($S)-1]->file);
    $file = substr_replace($parts["path"], "_edit", - 4, 0);
    if(is_file($file)){
        unlink($file);
    }
    
    $command = "ffmpeg -i ".($S[count($S)-1]->file).$img_input
    ." -filter_complex \"".$filter
    ." -map [dest".$vcount."] -map 0:a -movflags faststart ".$file." 2>&1";

    echo $command;
    
    $output = shell_exec($command);
    echo $output;

    $jumpUrl = "index.html?file=".$file;
    echo $jumpUrl;

    echo "<script type='text/javascript'>";
    echo "window.location.href='$jumpUrl'";
    echo "</script>";
?>
