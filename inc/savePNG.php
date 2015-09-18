<?php
    $image = $_POST['image'];
    $filedir = $_POST['filedir'];
    //$name = substr(time(),0, -2);
    //$name = 'tempImage';



    $image = str_replace('data:image/png;base64,', '', $image);
    $decoded = base64_decode($image);

    file_put_contents($filedir, $decoded, LOCK_EX);


   echo $image;
   //$jsonName = json_encode($name);
   echo $filedir;
 
?> 