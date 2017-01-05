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

  public function save ($invId, $data) {
    global $collection;

    $invoice = [
      'totalPrice' => $data->totalPrice,
      'currency' => $data->currency,
      'paid' => 'false',
      'invId' => $invId
    ];

    foreach ($data->staticData as $key => $value) {
      $invoice[$key] = $value;
    }

    $desc = $data->desc;
    $hour = $data->hour;
    $price = $data->price;

    for ($i = 0; $i < count($desc); $i++) {
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

    if ($data->spk) {
        $invoice['spk'] = $data->spk;
    }
    if ($data->at) {
      $invoice['at'] = $data->at;
    }
    if ($data->su) {
      $invoice['su'] = $data->su;
    }

    $res = $collection->insert($invoice);
    $res['obj'] = $invoice;
    return $res;
  }

  // Saves receiver and sender mail addresses after an invoice is mailed.
  public function save_email($data) {
    global $collection;
    try {
      $res = $collection->update(['invId' => $data->invId], [
              '$set' => [
                  'senderEmail' => $data->senderEmail,
                  'receiverEmail' => $data->receiverEmail
              ]
          ]
      );
    } catch (\Exception $e) {
      die(json_encode(['error' => $e->getMessage()]));
    }

    $res['id'] = $data->invId;
    return $res;
  }

  public function update ($invId, $updatedValues) {
    global $collection;
    $res = $collection->update(['invId' => $invId], $updatedValues);
    return $res;
  }
}
