<?php

    function logIntoPostgreSQL(){
        $dbConn = pg_connect("host=localhost dbname=ornlbsd user=cesium password=B!oSc1enc3$ connect_timeout=5");

        if ($dbConn) {
            error_log('Connection attempt succeeded.');
            return $dbConn;
        } else {
            error_log('Connection attempt failed. Exiting PHP file.');
            exit();
        }

    }
?>