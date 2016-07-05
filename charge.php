<?php

require_once('config.php');
require_once('utilities.php');
require_once('vendor/autoload.php');

$invoice_id = get_parameter('id');

use Parse\ParseClient;

ParseClient::initialize(getenv('PARSE_KEY1'), getenv('PARSE_KEY2'), getenv('PARSE_KEY3'));

use Parse\ParseQuery;

// Get sk from Parse
$query = new ParseQuery("Invoice");
try {
    $invoice = $query->get($invoice_id);
    // The object was retrieved successfully.
    $sk = $invoice->get("at");
    $totalPrice = $invoice->get('totalPrice');
    $currency = getCurrency($invoice->get('currency'));
} catch (ParseException $ex) {
    print_r($ex);
    // The object was not retrieved successfully.
    // error is a ParseException with an error code and message.
    //consoleLog("Error retrieving Invoice ID");
}
// Set your secret key: remember to change this to your live secret key in production
// See your keys here https://dashboard.stripe.com/account

if ($sk != "") {
    // Set Stripe sk
    Stripe::setApiKey($sk);

    $token = $_POST['stripeToken'];
    $email = $_POST['stripeEmail'];

    try {
        $customer = Stripe_Customer::create(array(
            'email' => $email,
            'card' => $token
        ));

        $charge = Stripe_Charge::create(array(
            'customer' => $customer->id,
            'amount' => $totalPrice * 100,
            'currency' => $currency
        ));

        // Payment executed successfully
        //echo '<h1>Successfully charged '.$_POST['currency'].$_POST['amount'].' </h1>';
        // If Successfully Charge
        if ($charge->paid) {
            // Set invoice paid true
            $invoice->set("paid", "true");
            $invoice->save();

            // Set invoice payment date
            $invoice->set("paymentDate", "" . $charge->created);
            $invoice->save();
            // Redirect to the invoice itself -- Button will render 'paid'
            header("Location:/" . $invoice_id); // Redirect to
        } else {
            echo '<h1>Error: Payment Unsuccessful</h1>';
        }
    } catch(Stripe_CardError $e) {
        $error1 = $e->getMessage();
        putStripeError($e);
        echo '<h1>Error #1: Card Error </h1>';
    } catch (Stripe_InvalidRequestError $e) {
        // Invalid parameters were supplied to Stripe's API
        $error2 = $e->getMessage();
        echo '<h1>Error #2: Invalid parameters were supplied to Stripe API </h1>';

    } catch (Stripe_AuthenticationError $e) {
        // Authentication with Stripe's API failed
        $error3 = $e->getMessage();
        echo '<h1>Error #3: Authentication with Stripe API failed </h1>';

    } catch (Stripe_ApiConnectionError $e) {
        // Network communication with Stripe failed
        $error4 = $e->getMessage();
        echo '<h1>Error #4: Network communication with Stripe failed </h1>';

    } catch (Stripe_Error $e) {
        // Display a very generic error to the user, and maybe send
        // yourself an email
        $error5 = $e->getMessage();
        echo '<h1>Error #5: Generic Error </h1>';

    } catch (Exception $e) {
        // Something else happened, completely unrelated to Stripe
        $error6 = $e->getMessage();
        echo '<h1>Error #6: Something weird happened </h1>';

    }
} else {

    echo '<h1>Error: No such SK!</h1>';
}
?>
