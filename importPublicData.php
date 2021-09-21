<?php

require_once "login.php";

$dbConn = logIntoPostgreSQL();
$geojsonArray = getPolygonCenter($dbConn);
echo json_encode($geojsonArray);

function getPolygonCenter($dbConn){
    $geojsonArray = array();
    $result = pg_query($dbConn, "select query_common_garden_borders();");
    error_log(print_r($result, true));
        while ($row = pg_fetch_row($result)) {
            error_log(print_r($row, true));
            // build array
            array_push($geojsonArray, $row);
        }
    pg_close($dbConn);
    return $geojsonArray;
}

?>