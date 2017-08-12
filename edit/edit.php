<!-- lang: php -->

<?php
    parse_str(urldecode($_SERVER["QUERY_STRING"]));
    echo $script;

    $S=json_decode($script);
    print_r($S);
?>
