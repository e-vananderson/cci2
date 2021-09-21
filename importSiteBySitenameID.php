<?php

require_once "login.php";

ini_set("session.cookie_httponly", True); // The following line sets the HttpOnly flag for session cookies - make sure to call it before you call session_start()
session_start();
header("Content-Type: application/json");

//$body = http_get_request_body('php://input');  //another method to get header body contents
$body = file_get_contents('php://input');

$body = htmlentities($body);

error_log($body);

$dbConn = logIntoPostgreSQL();
$geojsonArray = getGenotypePoints($dbConn, $body);
echo json_encode($geojsonArray);

function getGenotypePoints($dbConn, $body){
    $geojsonArray = array();

    $randomColor = rand_color_only_blue();

//    $result = pg_query($dbConn, "select query_site_sitename_id('$body', '$randomColor');");
    $result = pg_query_params($dbConn, "select query_site_sitename_id($1, $2)",
        array($body, $randomColor));

    error_log('Query result:');
    error_log(print_r($result, true));
    while ($row = pg_fetch_row($result)) {
        error_log(print_r($row, true));
        // build array
        array_push($geojsonArray, $row);
    }
    pg_close($dbConn);
    return $geojsonArray;
}

function rand_color_only_blue() {

    return sprintf('#%06X', mt_rand(0, 0x0000FF));

}
?>
