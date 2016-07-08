<?php

require_once('vendor/autoload.php');

$isDevelopment = getenv('PHP_ENV') == 'development';

// All errors are hidden by default on production but are printed on development
if ($isDevelopment) {
  ini_set('display_errors', 1);
} else {
  ini_set('display_errors', 0);
}
date_default_timezone_set('America/Los_Angeles');

// Setup Stripe array
$secret_key = getenv('STRIPE_SECRET_KEY');
$publishable_key = getenv('STRIPE_PUBLISHABLE_KEY');

$stripe = array(
    "secret_key"      => $secret_key,
    "publishable_key" => $publishable_key,
);

$stripe_token_url = 'https://connect.stripe.com/oauth/token';

\Stripe\Stripe::setApiKey($stripe['secret_key']);
?>
