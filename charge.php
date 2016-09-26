<?php

require_once('config.php');
require_once('utilities.php');
require_once('vendor/autoload.php');
require_once('mongo.php');

$invoice_id = get_parameter('id');

use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Charge;
// use Stripe\Stripe_Error;
use Stripe\CardError;
use Stripe\AuthenticationError;
use Stripe\InvalidRequestError;
use Stripe\ApiConnectionError;

try {
    $mongo = new MongoInvoice();
    // Find invoice
    $invoice = $mongo->get($invoice_id);
    $sk = $invoice["at"];
    $totalPrice = $invoice['totalPrice'];
    $currency = getCurrency($invoice['currency']);

    if ($sk != "") {
        // Set Stripe sk
        Stripe::setApiKey($sk);

        $token = $_POST['stripeToken'];

        $email = isset($_POST['stripeEmail']) ? $_POST['stripeEmail'] : '';

        try {
            // Create a new customer at Stripe
            $customer = Customer::create(array(
                'email' => $email,
                'card' => $token
            ));

            // Charge the customer over Stripe
            $charge = Charge::create(array(
                'customer' => $customer->id,
                'amount' => $totalPrice * 100,
                'currency' => $currency
            ));

            // Payment executed successfully
            //echo '<h1>Successfully charged '.$_POST['currency'].$_POST['amount'].' </h1>';
            // If Successfully Charge
            if ($charge->paid) {
                // Set invoice paid true
                $invoice['paid'] = true;
                $mongo->update($invoice['_id']->{'$id'}, [
                    '$set' => [
                        'paid' => true,
                        'paymentDate' => '' . $charge->created
                    ]
                ]);
                // Redirect to the invoice itself -- Button will render 'paid'
                header("Location:/" . $invoice_id); // Redirect to
            } else {
                echo '<h1>Error: Payment Unsuccessful</h1>';
            }
        } catch(CardError $e) {
            $error1 = $e->getMessage();
            putStripeError($e);
            echo '<h1>Error #1: Card Error </h1>';
        } catch (InvalidRequestError $e) {
            // Invalid parameters were supplied to Stripe's API
            $error2 = $e->getMessage();
            if ($isDevelopment) {
                var_dump($error2);
            }
            echo '<h1>Error #2: Invalid parameters were supplied to Stripe API </h1>';

        } catch (AuthenticationError $e) {
            // Authentication with Stripe's API failed
            $error3 = $e->getMessage();
            if ($isDevelopment) {
                var_dump($error3);
            }
            echo '<h1>Error #3: Authentication with Stripe API failed </h1>';

        } catch (ApiConnectionError $e) {
            // Network communication with Stripe failed
            $error4 = $e->getMessage();
            if ($isDevelopment) {
                var_dump($error4);
            }
            echo '<h1>Error #4: Network communication with Stripe failed </h1>';

        } catch (\Stripe\Error $e) {
            // Display a very generic error to the user, and maybe send
            // yourself an email
            $error5 = $e->getMessage();
            if ($isDevelopment) {
                var_dump($error5);
            }
            echo '<h1>Error #5: Generic Error </h1>';

        } catch (Exception $e) {
            // Something else happened, completely unrelated to Stripe
            $error6 = $e->getMessage();
            if ($isDevelopment) {
                var_dump($error6);
            }
            echo '<h1>Error #6: Something weird happened </h1>';

        }
    } else {

        echo '<h1>Error: No such SK!</h1>';
    }

} catch (Exception $ex) {
    die (print_r($ex));
}
// Set your secret key: remember to change this to your live secret key in production
// See your keys here https://dashboard.stripe.com/account
