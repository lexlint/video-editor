<!-- lang: php -->
/*
input:
[
{"type":"img","file":"zm.png","begin":2.653972,"end":30.022,"animate":false,"top":35,"left":90,"width":60,"height":60,"zorder":"0"},
{"type":"img","file":"tt.png","begin":6.532061,"end":30.022,"animate":true,"top":144,"left":328,"width":112,"height":112,"zorder":"0"},
{"type":"img","file":"clock.png","begin":12.083265,"end":30.022,"animate":true,"top":344,"left":685,"width":109,"height":109,"zorder":"0"},
{"type":"txt","text":"你好","begin":0,"end":30,"family":"STSong","size":"50","color":"#000000","top":131,"left":413,"width":230,"height":97,"zorder":"0"},
{"type":"mov","file":"../video/lol3.mp4"}
]

 
output:
ffmpeg -i lol3.mp4 -ignore_loop 0 -i clock.png -ignore_loop 0 -i tt.gif -i numb.mp3 -filter_complex "\
[1:v]scale=150:150[src1];\
[2:v]scale=150:150[src2];\
[0:v][src1]overlay=x=10:y=10:enable='between(t,0,10):shortest=1'[dest1];\
[dest1][src2]overlay=x=120:y=120:enable='between(t,8,19):shortest=1'[dest2];\
[dest2] drawtext=fontfile=/Library/Fonts/Songti.ttc:text=你好:fontcolor=red:fontsize=48:x=150:y=200:enable='between(t,7,15)'[dest3];\
[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.9[a0];\
[3:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.0[a3];\
[a0][a3]amix=inputs=2:duration=first[aout]\
" -map [dest3] -map [aout] out.mp4
*/

<?php
    parse_str(urldecode($_SERVER["QUERY_STRING"]));
    echo $script;

    $script = base64_decode($script);
    echo $script;
    $script = urldecode($script);
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
    
    $fonts_file = fopen("../fonts/fonts.json", "r") or die("Unable to open font.json!");
    $fonts_content = fread($fonts_file,filesize("../fonts/fonts.json"));
    fclose($fonts_file);
    $fonts=json_decode($fonts_content);
    
    class fonts_filter
    {
        private $txt_family = "aa";
        public function do_filter($array, $family)
        {
            $this->txt_family = $family;
            return array_filter($array, array($this,'font_selector'));
        }
        private function font_selector($v)
        {
            print_r($v);
            return $v->fontMac == $this->txt_family || $v->fontWindows == $this->txt_family;
        }
    }
    
    foreach ($txts as $txt) {
        $vcount ++;
        $tmp_file_name = "./tmp/text".$vcount.".txt";
        $tmp_file = fopen($tmp_file_name, "w") or die("Unable to open tmp.txt!");
        fwrite($tmp_file, str_replace("%", "\\%", str_replace("\\", "\\\\", $txt->text)));
        fclose($tmp_file);
        
        $filter = new fonts_filter();
        
        $fonts_cur = $filter->do_filter($fonts, $txt->family);
        $font_file = "";
        foreach ($fonts_cur as $font) {
            $font_file = $font->file;
            break;
        }
        
        $txt_overlay .= ($vcount==1?"[0:v]":"[dest".($vcount-1)."]")." drawtext=fontfile=../fonts/".$font_file.":textfile='".$tmp_file_name."':fontcolor=".($txt->color).":fontsize=".($txt->size).":x=".($txt->left).":y=".($txt->top).":enable='between(t,".($txt->begin).",".($txt->end).")'[dest".$vcount."];";
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
