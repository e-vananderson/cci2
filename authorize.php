<?php

    require_once 'vendor/autoload.php';
    require_once "login.php";

//    $message ='';

    $jwt = new \Firebase\JWT\JWT;
    $jwt::$leeway = 8;

//    error_log(print_r($_POST, true));
    $id_token = $_POST['GoogleToken'];
//error_log($id_token);
//    $CLIENT_ID = '865956965372-emdrpiiurvqp032k7ggrm6e7vrrndu1h.apps.googleusercontent.com';
//    $CLIENT_ID = '201215494908-6ef7tqlbo2e0vqvbt3he0nnlnu3n5l1t.apps.googleusercontent.com'; //ORNLBSD's google cloud OAuth ID
    $client = new Google_Client();
//    $client = new Google_Client(['client_id' => $CLIENT_ID]); // Specify the CLIENT_ID of the app that accesses the backend

    do {
        $attempt = 0;
        try {
            $payload = $client->verifyIdToken($id_token);
            $retry = false;
        } catch (Firebase\JWT\BeforeValidException $e) {
            $attempt++;
            $retry = $attempt < 2;
        }
    } while ($retry);
    //$payload = $client->verifyIdToken($id_token);
    if ($payload) {
        //check that the aud claim contains one of your app's client IDs (already done in line 7??)
//        if ($CLIENT_ID == $payload['aud']){
            $userid = htmlentities($payload['sub']);
            $email = htmlentities($payload['email']);
            $name = htmlentities($payload['name']);

            // If request specified a G Suite domain:
            //$domain = $payload['hd'];

            # array for query results
            $qryResponseArray = array();

            # query DB to see if google ID is in the table
            $dbConn = logIntoPostgreSQL();
//            $result = pg_query($dbConn, "select google_id, name, email, user_id from lookup_users
//                                                where google_id = '$userid' and active = 'Y';");
            $result = pg_query_params($dbConn, "select google_id, name, email, user_id from lookup_users 
                                                    where google_id = $1 and active = 'Y'", array($userid));
            $numRows = pg_num_rows($result);
            if ($result){
                if ($numRows > 0){
                    # is the DB's email address or name different than what's in the token?
                    while ($row = pg_fetch_row($result)) {
                        array_push($qryResponseArray, htmlentities($row[1])); // user name
                        array_push($qryResponseArray, htmlentities($row[3])); // user's DB ID
//                    error_log(print_r($row, true));
//                        if($userid == $row[0]){ //redundant since googleID's equality is checked via the qry's criteria
                            if ($email == $row[2]){
                                # if all is verified:
//                                echo 'Welcome, ' . $name . '!';
                                echoResultAndCloseConn($dbConn, $qryResponseArray);
                            }
                            else {
                                echo '<script>alert("Note - the email in the database does not match the Google email associated with this account.")</script>';
//                                echo 'Welcome, ' . $name . '! Note: The database email needs updating.';
                                echoResultAndCloseConn($dbConn, $qryResponseArray);
                            }
//                        }
//                        else {
//                            echo '<script>alert("Note - the Google ID for user ' . $name . ' does not match what is in the database.")</script>';
////                            echo 'The google ID for user ' . $name . ' does not match what is in the database!';
//                            return $qryResponseArray;
//                        }
                    }
                }
                else {
//                    $message = 'User was not found in the database!';
                }

            }
            else {
//                $message = 'Resource is empty.';
            }
//            echo $message;
//        }
//        else {
//            echo 'Aud does not match!';
//        }

    } else {
        // Invalid ID token
//        echo 'Invalid ID token!';
    }

    function echoResultAndCloseConn($dbConn, $qryResponseArray){
        pg_close($dbConn);
        echo json_encode($qryResponseArray);
    }
?>
