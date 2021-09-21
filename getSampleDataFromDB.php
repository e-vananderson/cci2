<?php

// https://medium.com/@whole9681/javascript-fetch-api-to-send-data-8c2b1dedaba#
ini_set("session.cookie_httponly", True); // The following line sets the HttpOnly flag for session cookies - make sure to call it before you call session_start()
session_start();
header("Content-Type: application/json");

//$body = http_get_request_body('php://input');  //another method to get header body contents
$body = file_get_contents('php://input');


$dbConn = logIntoPostgreSQL();
echo json_encode(getSampleData($dbConn, $body));

function getSampleData($dbConn, $body){

    $sampleArray = array();

    $obj_array = json_decode($body, true);

    error_log(print_r($obj_array, true));

    //clear temp table
    pg_query($dbConn, "DELETE FROM temp_bsd_site_id");

    //insert rows
    foreach ($obj_array as $json){
//        pg_query($dbConn, "INSERT INTO temp_bsd_site_id VALUES(" . $json . ")");
        pg_query_params($dbConn, "INSERT INTO temp_bsd_site_id VALUES($1)",
            array($json));
    }

    //get sample data
    $result = pg_query($dbConn, "
        select j.info --jgi_samples
        from jgi_sample j
        join bsd_tree t on j.bsd_site_id = t.site_id
        join bsd_sample s on t.id = s.tree_id
        where j.bsd_site_id in (select bsd_site_id from temp_bsd_site_id)
        group by j.sample_id
        union all
        select sm.info --bsd_samples
        from bsd_sample sm
        join bsd_tree t on sm.tree_id = t.id
        join bsd_site st on st.id = t.site_id
        where st.id in (select bsd_site_id from temp_bsd_site_id)
        ;");
    error_log(print_r($result, true));
    while ($row = pg_fetch_row($result)) {
        error_log(print_r($row, true));
        // build array
        array_push($sampleArray, $row);
    }

    pg_close($dbConn);
    return $sampleArray;


}
