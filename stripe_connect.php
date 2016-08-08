<?php
require_once 'config.php';
require_once 'utilities.php';
require_once('vendor/autoload.php');
require_once('mongo.php');

////////
$error = get_parameter('error');
$error_description = get_parameter('error_description');
$scope = get_parameter('scope');
$code = get_parameter('code');

if ($scope && $code) {
    $post = array(
        'client_secret' => $secret_key,
        'code' => $code,
        'grant_type' => 'authorization_code'
    );

    // We got the scope and code. We'll exchane this with the SPK and AT by running a curl function
    $res = json_decode(postToCurl($stripe_token_url, $post));

    if (isset($res->error) || isset($res->error_description)) {
        $s = "Error: ".$res->error." - ".$res->error_description;
    } else {
        $accessToken = $res->access_token;
        $pubKey = $res->stripe_publishable_key;
        $stripe_user = $res->stripe_user_id;

        $mongo = new MongoInvoice();
        $collection = $mongo->getCollection();
        $results = $collection->find([ 'su' => $stripe_user ]);

        // Everytime we need to check SPK and AT for all invoices of a user, in case of possible overrides or invokes
        foreach ($results as $old_invoice_model) {
            if (($old_invoice_model['at'] != $accessToken) || ($old_invoice_model['spk'] != $pubKey) ) {
                $mongo->update($old_invoice_model['_id']->{'$id'}, [
                    '$set' => [
                        'at' => $accessToken,
                        'spk' => $pubKey
                    ]
                ]);
            }
        }
    }


} else if ($error || $error_description) {
    // Error
    $s = "Error: ".$error." - ".$error_description;
}

require_once 'index.thtml';


?>
