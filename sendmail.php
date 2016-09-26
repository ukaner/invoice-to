<?php

require_once('config.php');
require_once('utilities.php');

use Mailgun\Mailgun;

$from_email = get_parameter('from_email');
$mailTo = get_parameter('mailTo');
$mailFrom = get_parameter('mailFrom');
$mailSubject = get_parameter('mailSubject');
$mailBody = get_parameter('mailBody');

$client = new \Http\Adapter\Guzzle6\Client();
$mg = new Mailgun(getenv('MAILGUN_KEY'), $client);
$domain = getenv('MAILGUN_DOMAIN');

try {
    $mg->sendMessage($domain, [
        'from' => $mailFrom,
        'to' => $mailTo,
        'subject' => $mailSubject,
        'html' => $mailBody
    ]);
} catch (Exception $e) {
    die('A mandrill error occurred: ' . get_class($e) . ' - ' . $e->getMessage());
}
