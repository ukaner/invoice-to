<?php

require_once('utilities.php');
require_once 'vendor/mandrill-api-php/src/Mandrill.php';

$mandrill_key = getenv('MANDRILL_KEY');
$from_email = get_parameter('from_email');
$mailTo = get_parameter('mailTo');
$mailFrom = get_parameter('mailFrom');
$mailSubject = get_parameter('mailSubject');
$mailBody = get_parameter('mailBody');

try {
    $mandrill = new Mandrill($mandrill_key);
    $message = array(
        'html' => $mailBody,
        'subject' => $mailSubject,
        'from_email' => $from_email,
        'from_name' => $from_email,
        'to' => array(
            array(
                'email' => $mailTo,
                'type' => 'to'
            ),
            array(
                'email' => $mailFrom,
                'type' => 'bcc'
            )
        ),
        'important' => true,
        'track_opens' => true,
        'track_clicks' => true,
        'merge' => true,
        'global_merge_vars' => [],
        'merge_vars' => [],
        'attachments' => NULL,
        'images' => NULL
    );
    $async = true;
    $result = $mandrill->messages->send($message, $async);
//    print_r($result);
    echo true;
} catch (Mandrill_Error $e) {
    echo 'A mandrill error occurred: ' . get_class($e) . ' - ' . $e->getMessage();
    throw $e;
}
?>
