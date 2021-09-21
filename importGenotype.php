<?php

require_once "login.php";

ini_set("session.cookie_httponly", True); // The following line sets the HttpOnly flag for session cookies - make sure to call it before you call session_start()
session_start();
header("Content-Type: application/json");

$body = file_get_contents('php://input');

$body = htmlentities($body);

error_log($body);

$dbConn = logIntoPostgreSQL();
$geojsonArray = getGenotypePoints($dbConn, $body);
echo json_encode($geojsonArray);

function getGenotypePoints($dbConn, $body){
    $geojsonArray = array();

    $randomColor = rand_color_no_blue();

//    $result = pg_query($dbConn, "select query_site_genotype('$body', '$randomColor');");
    $result = pg_query_params($dbConn, "select query_site_genotype($1, $2)",
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

function rand_color_no_blue() {

    return sprintf('#%06X', mt_rand(0, 0xFFFF00));

}
?>