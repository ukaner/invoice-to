<?php

require_once('config.php');
require_once('vendor/autoload.php');
require_once('utilities.php');
require_once('ChromePhp.php');
require_once('mongo.php'); // Loading our MongoDB wrapper


function newObjectId ($size) {
  $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' .
           'abcdefghijklmnopqrstuvwxyz' .
           '0123456789';

  $objectId = '';
  $bytes = random_bytes($size);

  for ($i = 0; $i < strlen($bytes); ++$i) {
    $index = unpack('C', $bytes[$i])[1] % strlen($chars);
    $objectId .= $chars[$index];
  }
  return $objectId;
}


try {
  $mongo = new MongoInvoice();

  switch (get_parameter('type')) {
    case 'get':
      $res = $mongo->get(get_parameter('invID'));
      die(json_encode($res));
      break;

    case 'create':
      $invId = newObjectId(10);
      $res = $mongo->save($invId);

      if ($res['ok']) {
        die(json_encode([ 'invId' => $invId ]));
      }

      if ($isDevelopment) {
        die(json_encode(['error' => 'Failed to create new object, with error message: ' + $res['errmsg']]));
      } else {
        die(json_encode(['error' => 'Failed to create new object']));
      }
      break;

    case 'save_email':
      $res = $mongo->save_email();
      $invId = $res['invId'];

      // Check if invoice inserted to MongoDB successfully
      if ($res['ok']) {
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
