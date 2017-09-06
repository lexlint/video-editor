<?php

function getGUID(){
    mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
    $charid = strtoupper(md5(uniqid(rand(), true)));
    $hyphen = chr(45);// "-"
    $uuid = //chr(123).// "{"
        substr($charid, 0, 8).$hyphen
        .substr($charid, 8, 4).$hyphen
        .substr($charid,12, 4).$hyphen
        .substr($charid,16, 4).$hyphen
        .substr($charid,20,12);
    //.chr(125);// "}"
    return $uuid;
}

if ($_FILES["file"]["size"] < 10*1024*1024)
{
    if ($_FILES["file"]["error"] > 0)
    {
        echo "{\"errcode\": ".$_FILES["file"]["error"].", \"desc\": \"Error!\"}";
    }
    else
    {
        echo "{\"upload\": \"" . $_FILES["file"]["name"] . "\",";
        echo "\"type\": \"" . $_FILES["file"]["type"] . "\",";
        echo "\"size\": \"" . ($_FILES["file"]["size"] / 1024) . " Kb\",";

        $suffix = substr($_FILES["file"]["name"], strrpos($_FILES["file"]["name"], "."));
        $filename = getGUID().$suffix;
        if (file_exists("upload/" . $filename))
        {
            unlink($filename);
        }
        move_uploaded_file($_FILES["file"]["tmp_name"], "upload/".$filename);
        echo "\"returnName\": \"" . $filename."\"}";
    }
}
else
{
    echo "{\"errcode\": 400, \"desc\": \"Invalid File!\"}";
}
?>
