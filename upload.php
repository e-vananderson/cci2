<?php

/*Code from https://www.theserverside.com/blog/Coffee-Talk-Java-News-Stories-and-Opinions/Ajax-JavaScript-file-upload-example */

/* Get the name of the uploaded file */
$filename = $_FILES['file']['name'];

/* Choose where to save the uploaded file */
$location = "dropzone/".$filename;

/* Save the uploaded file to the local filesystem */
if ( move_uploaded_file($_FILES['file']['tmp_name'], $location) ) { 
  echo 'Success'; 
} else { 
  echo 'Failure'; 
}

?>