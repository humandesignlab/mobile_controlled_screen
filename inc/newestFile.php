
<?php
$directory = '../generated_images';
$scanned_directory = array_diff(scandir($directory), array('..', '.'));

print_r(end($scanned_directory));
?>