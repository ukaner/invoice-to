<?php

require_once('config.php');
require_once('utilities.php');
require_once('ChromePhp.php');

use Parse\ParseClient;

ParseClient::initialize(getenv('PARSE_KEY1'), getenv('PARSE_KEY2'), getenv('PARSE_KEY3'));

use Parse\ParseQuery;
use Parse\ParseObject;

if (get_parameter('type') == 'get') {
	$invoice_id = get_parameter('invID');
    $staticData = ["invBy",
                    "invDateTop",
                    "invDate",
                    "invToTop",
                    "invTo",
                    "invFor",
                    "invByName",
                    "invNumber",
                    "dueDateTop",
                    "dueDate",
                    "invRef",
                    "payDetails",
                    "invTerms",
                    "paid",
                    "paymentDate",
                    "currency",
                    "vatp",
                    "rowCount",
                    "spk",
                    "at",
                    "su",
                    "totalPrice",
                    "su"
                   ];

    $query = new ParseQuery("Invoice");

    try {
        $result = array();
        $invoice = $query->get($invoice_id);

        foreach($staticData as $value){
            $result[$value] = $invoice->get($value);
        }

        // PHP thinks "0" string is NULL. This fixes that, since VAT can not be null
        if(empty($result["vatp"])) $result["vatp"] = "0";

        for ($i = 1; $i <= $result['rowCount']; $i++) {
            $result['itemDesc' . $i] = $invoice->get("itemDesc" . $i);
            $result['itemHour' . $i] = $invoice->get("itemHour" . $i);
            $result['itemPrice' . $i] = $invoice->get("itemPrice" . $i);
        }

        echo json_encode($result);
        // The object was retrieved successfully.

    } catch (ParseException $ex) {
        print_r($ex);
    }

} else if (get_parameter('type') == 'create') {

	// Get variables
    $paid = get_parameter('paid');
    $staticData = get_parameter('staticData');
    $totalPrice = get_parameter('totalPrice');
    $currency = get_parameter('currency');
    $rowCount = intval(get_parameter('rowCount'));
    $spk = get_parameter('spk');
    $at = get_parameter('at');
    $su = get_parameter('su');
    $desc = get_parameter('desc');
    $hour = get_parameter('hour');
    $price = get_parameter('price');

    // Initialize Parse object
    $invoice = new ParseObject("Invoice");

    // Push paid status
    $invoice->set('paid', 'false');

    // Push static data
    foreach ($staticData as $key => $value) {
        $invoice->set($key, $value);
    }

    // Push invoice table
    $invoice->set('totalPrice', $totalPrice);
    $invoice->set('currency', $currency);
    $invoice->set('rowCount', $rowCount);

    for ($i = 0; $i <= $rowCount; $i++) {
		$postfix = $i+1;
        $invoice->set('itemDesc' . $postfix, $desc[$i]);
        $invoice->set('itemHour' . $postfix, $hour[$i]);
        $invoice->set('itemPrice' . $postfix, $price[$i]);
    }

    // Push Stripe data if exists
    if($spk != "") $invoice->set('spk', $spk);
    if($at != "") $invoice->set('at', $at);
    if($at != "") $invoice->set('su', $su);


    try {
        $invoice->save();
        echo json_encode(['invId' => $invoice->getObjectId()]);
    } catch (ParseException $ex) {
        // Execute any logic that should take place if the save fails.
        // error is a ParseException object with an error code and message.
        echo json_encode(['error' => 'Failed to create new object, with error message: ' + $ex->getMessage()]);
    }
} else if (get_parameter('type') == 'save_email') {
	$senderEmail = get_parameter('senderEmail');
    $receiverEmail = get_parameter('receiverEmail');
    $invId = get_parameter('invId');

	$invoice = new ParseObject("Invoice", $invId);
	$invoice->set('senderEmail', $senderEmail);
    $invoice->set('receiverEmail', $receiverEmail);
	try {
        $invoice->save();
        echo json_encode(['invId' => $invoice->getObjectId()]);
    } catch (ParseException $ex) {
        // Execute any logic that should take place if the save fails.
        // error is a ParseException object with an error code and message.
        echo json_encode(['error' => 'Failed to create new object, with error message: ' + $ex->getMessage()]);
    }
}
?>
