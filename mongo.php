<?php

require_once('config.php');
require_once('utilities.php');
require_once('ChromePhp.php');
require_once('vendor/autoload.php');

$connection_url = getenv('MONGODB_URI');

 // create the mongo connection object
$m = new \MongoClient($connection_url);

// extract the DB name from the connection path
$url = parse_url($connection_url);
$db_name = preg_replace('/\/(.*)/', '$1', $url['path']);


// use the database we connected to
$db = $m->selectDB($db_name);
$collection = $db->selectCollection('invoices');

class MongoInvoice {

  public function getCollection () {
    global $collection;
    return $collection;
  }

  // Accepts both Parse-like IDs and Mongo IDs and
  // returns the corresponding invoice
  public function get ($invId) {
    global $collection;

    $parseRecord = $collection->findOne([ 'invId' => $invId ]);

    if (!!$parseRecord) return $parseRecord;

    return $collection->findOne([ '_id' => new MongoId(base64_decode($invId)) ]);
  }

  public function save ($invId) {
    global $collection;

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

    $invoice = [
      'totalPrice' => $totalPrice,
      'currency' => $currency,
      'paid' => 'false',
      'rowCount' => $rowCount,
      'invId' => $invId
    ];

    foreach ($staticData as $key => $value) {
      $invoice[$key] = $value;
    }

    // items the client is charged for
    for ($i = 0; $i <= $rowCount; $i++) {
      $postfix = $i + 1;

      if (isset($desc[$i])) {
        $invoice['itemDesc' . $postfix] = $desc[$i];
      } else {
        $invoice['itemDesc' . $postfix] = '';
      }

      if (isset($hour[$i])) {
        $invoice['itemHour' . $postfix] = $hour[$i];
      } else {
        $invoice['itemHour' . $postfix] = 0;
      }

      if (isset($price[$i])) {
        $invoice['itemPrice' . $postfix] = $price[$i];
      } else {
        $invoice['itemPrice' . $postfix] = 0;
      }
    }

    if ($spk != '') $invoice['spk'] = $spk;
    if ($at != '') $invoice['at'] = $at;
    if ($su != '') $invoice['su'] = $su;

    // Inserting final object to database
    $res = $collection->insert($invoice);
    $res['obj'] = $invoice;
    return $res;
  }

  // Saves receiver and sender mail addresses after an invoice is mailed.
  public function save_email () {
    global $collection;

    $res = $collection->update([
        '_id' => new MongoId(base64_decode(get_parameter('invId')))
      ], [
        '$set' => [
          'senderEmail' => get_parameter('senderEmail'),
          'receiverEmail' => get_parameter('receiverEmail')
        ]
      ]
    );

    $res['id'] = base64_decode(get_parameter('invId'));
    return $res;
  }

  public function update ($invId, $updatedValues) {
    global $collection;

    $res = $collection->update([
      '_id' => new MongoId($invId)
    ], $updatedValues);

    return $res;
  }
}
