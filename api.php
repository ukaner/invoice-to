<?php

require_once('config.php');
require_once('vendor/autoload.php');
require_once('utilities.php');
require_once('ChromePhp.php');
require_once('mongo.php'); // Loading our MongoDB wrapper
require_once('parse.php'); // Loading our Parse wrapper


try {
  $mongo = new MongoInvoice();
  $parse = new ParseInvoice();

  switch (get_parameter('type')) {
    case 'get':
      $res = $mongo->get(get_parameter('invID'));
      die(json_encode($res));
      break;

    case 'create':
      $res = $parse->save();
      $invoice = $res['obj'];

      // Check if invoice inserted to MongoDB successfully
      if ($res['ok']) {
        $invId = $res['obj']->getObjectId();
        $res = $mongo->save($invId);

        if ($res['ok']) {
          die(json_encode([ 'invId' => base64_encode($res['obj']['_id']->{'$id'}), 'parseInvId' => $invId ]));
        }

        die(json_encode([ 'invId' => base64_encode($res['obj']['_id']->{'$id'}) ]));
      }

      if ($isDevelopment) {
        die(json_encode(['error' => 'Failed to create new object, with error message: ' + $res['errmsg']]));
      } else {
        die(json_encode(['error' => 'Failed to create new object']));
      }
      break;

    case 'save_email':
      $res = $mongo->save_email();
      $invId = $res['id'];

      // Check if invoice inserted to MongoDB successfully
      if ($res['ok']) {
        $parse->save_email();
        die(json_encode([ 'invId' => $invId ]));
      }

      if ($isDevelopment) {
        die(json_encode(['error' => 'Failed to create new object, with error message: ' + $res['errmsg']]));
      } else {
        die(json_encode(['error' => 'Failed to create new object']));
      }
      break;
  }

// Error Handling
// Error messages are hidden on production mode but printed out on development mode
} catch ( MongoConnectionException $e ) {
  if ($isDevelopment) {
    die(json_encode(['error' => 'Error connecting to MongoDB server: ' + $e->getMessage()]));
  } else {
    die(json_encode(['error' => 'Failed to create new object']));
  }
} catch ( MongoException $e ) {
  if ($isDevelopment) {
    die(json_encode(['error' => 'Mongo Error: ' . $e->getMessage()]));
  } else {
    die(json_encode(['error' => 'Failed to create new object']));
  }
} catch ( Exception $e ) {
  if ($isDevelopment) {
    die(json_encode(['error' => 'Error: ' . $e->getMessage()]));
  } else {
    die(json_encode(['error' => 'Failed to create new object']));
  }
}

?>
