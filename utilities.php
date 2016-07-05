<?php

function consoleLog($s) {
    echo("<script>console.log('PHP: ".$s."');</script>");
}

function postToCurl($url, $post) {

    // $url is a URL string i.e 'http://www.someurl.com';
    // $post is an array i.e  array('client_secret' => 'secret', 'code' => 'code', 'grant_type' => 'authorization_code');

    $defaults = array( 
        CURLOPT_POST => 1, 
        CURLOPT_HEADER => 0, 
        CURLOPT_URL => $url, 
        CURLOPT_FRESH_CONNECT => 1, 
        CURLOPT_RETURNTRANSFER => 1, 
        CURLOPT_FORBID_REUSE => 1, 
        CURLOPT_TIMEOUT => 4, 
        CURLOPT_POSTFIELDS => http_build_query($post) 
    ); 

    $ch = curl_init(); 
    curl_setopt_array($ch, $defaults); 
    if( ! $result = curl_exec($ch)) {
        trigger_error(curl_error($ch)); 
    } else {
        return $result;
    }
    curl_close($ch); 
}

function get_parameter($param_name){
    if(isset($_REQUEST[$param_name]) && $_REQUEST[$param_name]){
        return $_REQUEST[$param_name];
    }else{
        return '';
    }
}

function getCurrency($currSymbol) {
    switch ($currSymbol) {
        case "$":
        return "usd";
        break;
        case "€":
        return "eur";
        break;
        case "£":
        return "gbp";
        break;
        default:
        return "";
        break;
    }
}

function putStripeError($e) {
    $body = $e->getJsonBody();
    $err = $body['error'];
    print('Status is:' . $e->getHttpStatus() . "\n");
    print('Type is:' . $err['type'] . "\n");
    print('Code is:' . $err['code'] . "\n");
    // param is '' in this case
    print('Param is:' . $err['param'] . "\n");
    print('Message is:' . $err['message'] . "\n");
}

?>