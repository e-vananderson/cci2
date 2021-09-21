<?php

require_once "login.php";

    // https://medium.com/@whole9681/javascript-fetch-api-to-send-data-8c2b1dedaba#
    ini_set("session.cookie_httponly", True); // The following line sets the HttpOnly flag for session cookies - make sure to call it before you call session_start()
    session_start();
    header("Content-Type: application/json");

    //$body = http_get_request_body('php://input');  //another method to get header body contents
    $body = file_get_contents('php://input');


    // log into postgres
    postgresMethod($body);

    function postgresMethod($body){
        $dbConn = logIntoPostgreSQL();
        getSeletedGenotypes($dbConn, $body);
//        createTableTest($dbConn);
    }

    function getSeletedGenotypes($dbConn, $body){

        error_log($body);

        $obj_array = json_decode($body, true);
        error_log(print_r($obj_array, true));
        //get pickedObjects
        $pickedObjects = $obj_array[0];


        pg_query($dbConn, "DELETE FROM public.temp_fairify_selection");
        foreach ($pickedObjects as $json){
//            pg_query($dbConn, "INSERT INTO public.temp_fairify_selection (info, geo_selection_poly) VALUES('" . $json . "',
//            ST_GeometryFromText('POLYGON((" . $obj_array[1] . "))'))");
            pg_query_params($dbConn, "INSERT INTO public.temp_fairify_selection (info, geo_selection_poly) VALUES($1,
//            ST_GeometryFromText('POLYGON(($2))'))",
                array($json, $obj_array[1]));
        }

        // refresh the view
        pg_query($dbConn, "REFRESH MATERIALIZED VIEW v_fairify_selection;");

        // run functions to create and populate BIOSCALES tables
        pg_query($dbConn, "select query_fairify_build_json_object();");
        pg_query($dbConn, "select query_fairify_create_tables();");

        pg_close($dbConn);
    }


?>