<?php

require_once "login.php";

ini_set("session.cookie_httponly", True);
session_start();
header("Content-Type: application/json");

$body = file_get_contents('php://input');

error_log($body);

$dbConn = logIntoPostgreSQL();
$geojsonArray = getTsPoints($dbConn, $body);
echo json_encode($geojsonArray);

function getTsPoints($dbConn, $body){

    $geojsonArray = array();

    $obj_array = json_decode($body);

    $route_table = htmlentities($obj_array->{'routeTable'});
    $start_point = htmlentities($obj_array->{'startingPoint'});

    $randomColor = rand_color_warm();

//    $result = pg_query($dbConn, "select query_route_ts_all_points('$route_table', '$start_point', '$randomColor');");
    $result = pg_query_params($dbConn, "select query_route_ts_all_points($1, $2, $3)",
        array($route_table, $start_point, $randomColor));

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

function rand_color_warm() {

    return sprintf('#%06X', mt_rand(0, 0xFF0000));

}
?>
