<?php

require_once('vendor/autoload.php');

ini_set('display_errors', 0);
date_default_timezone_set('America/Los_Angeles');

// Setup Stripe array
$stripe = array(
    "secret_key"      => getenv('STRIPE_SECRET_KEY'),
    "publishable_key" => getenv('STRIPE_PUBLISHABLE_KEY'),
);

$stripe_token_url = 'https://connect.stripe.com/oauth/token';

\Stripe\Stripe::setApiKey($stripe['secret_key']);
?>
