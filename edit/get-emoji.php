<?php
# Identifies APNGs
# Written by Coda, functionified by Foone/Popcorn Mariachi#!9i78bPeIxI
# This code is in the public domain
# identify_apng returns:
# true if the file is an APNG
# false if it is any other sort of file (it is not checked for PNG validity)
# takes on argument, a filename.
function identify_apng($filename)
{
    $img_bytes = file_get_contents($filename);
    if ($img_bytes)
    {
        if(strpos(substr($img_bytes, 0, strpos($img_bytes, 'IDAT')),
                'acTL')!==false)
        {
            return true;
        }
    }
    return false;
}

$output = "[";
$dir=dirname(__FILE__)."/emoji/";
$files=opendir($dir.".");
while (false !== ($file = readdir($files)))
{
    if ($file != "." && $file != ".." && !is_dir($dir.$file) && substr($file, 0, 1) != ".") {
        $output .= "{\"id\":\"".substr($file, 0, strripos($file, "."))."\", \"file\":\"".$file."\", \"animate\":".(identify_apng($dir.$file)?"true":"false")."},";
    }
}
$output = substr($output, 0, strlen($output)-1);
$output .= "]";
closedir($files);

echo $output;
?>
