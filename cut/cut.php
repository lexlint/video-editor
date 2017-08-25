<!-- lang: php -->
<!-- ~/nginx_sites/index.php -->

<?php
//echo phpinfo();
//cut.php?video=http://localhost/video/7j.mp4&segments[]=-ss 00:01:30 -t 00:01:38&segments[]=-ss 00:06:26 -t 00:02:28&
# silently fails to handle multiple values
//echo urldecode($_SERVER["QUERY_STRING"])."<br>"; #id=5

//$str = "segments[]=-ss 00:00:10 -t 00:00:10&segments[]=-ss 00:00:50 -t 00:00:20";
parse_str(urldecode($_SERVER["QUERY_STRING"]));

$jumpUrl = "cut_result.html?";

$jumpUrl .= "filesCount=".count($segments)."&";

for ($x=0; $x<count($segments); $x++) {
    echo $segments[$x];
    echo "<p>";

    $parts = parse_url($video);

    $file = substr_replace($parts["path"], "_".$x, - 4, 0);

    $command = "ffmpeg ".$segments[$x]." -i ".$video." -c copy -movflags faststart ".$file." 2>&1";

    echo $command;
    echo "<p>";
    if(is_file($file)){
        unlink($file);
    }
    $jumpUrl .= "files".$x."=".$file."&";

    $output = shell_exec($command);
    //echo $output;
};
echo $jumpUrl;

echo "<script type='text/javascript'>";
echo "window.location.href='$jumpUrl'";
echo "</script>";

//echo shell_exec("ffmpeg -ss 00:00:10 -t 00:00:10 -i lol.mp4 -c copy -movflags faststart lol6.mp4  2>&1");
?>
