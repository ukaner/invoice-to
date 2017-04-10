import os, time
from pymongo import MongoClient
import logging
from logging.handlers import RotatingFileHandler

IS_DEVELOPMENT = os.getenv('INVOICE_ENVIRONMENT', 'DEVELOPMENT') == 'DEVELOPMENT'

os.environ.setdefault('TZ', 'America/Los_Angeles')
time.tzset()

STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', 'sk_test_me8bBVWp9JFm0TxNnMAqXskt')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', 'pk_test_ZWWcrRufqIYGGnoB78MEnMVJ')
STRIPE_TOKEN_URL = 'https://connect.stripe.com/oauth/token'
STRIPE_API_VERSION = '2016-07-06'

STRIPE = {
    'secret_key': STRIPE_SECRET_KEY,
    'publishable_key': STRIPE_PUBLISHABLE_KEY
}

#STRIPE_WORKER = StripeWorker(STRIPE_SECRET_KEY, STRIPE_API_VERSION)


MONGODB_DB_URL = os.getenv('MONGODB_URI', 'mongodb://127.0.0.1:27017/')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'invoice_to_test')
client = MongoClient(MONGODB_DB_URL)
db = client[MONGODB_DB_NAME]

MAILGUN_URL = 'https://api.mailgun.net/v3/{}/messages'
MAILGUN_KEY = os.getenv('MAILGUN_KEY', 'key-288770eeee4e15b7aa6e9ae81f23c271')
MAILGUN_DOMAIN = os.getenv('MAILGUN_DOMAIN', 'sandbox4caf4dd2284e40d1b32569abf8bd76a8.mailgun.org')



GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY','AIzaSyBXi7UY6eXvEzKFFOqAWXaMzviXie4dHRQ')
GOOGLE_URL_CALENDAR_LIST = 'https://www.googleapis.com/calendar/v3/users/me/calendarList'
GOOGLE_URL_CONTACTS_LIST = 'https://www.google.com/m8/feeds/contacts/{0}/full'
GOOGLE_URL_EVENT_LIST = 'https://www.googleapis.com/calendar/v3/calendars/{0}/events'
GOOGLE_URL_DRIVE_LIST = 'https://www.googleapis.com/drive/v2/files'
GOOGLE_URL_MESSAGE_LIST = 'https://www.googleapis.com/gmail/v1/users/{0}/messages'
GOOGLE_URL_MESSAGE_SEND = 'https://www.googleapis.com/gmail/v1/users/{0}/messages/send'


logger = logging.getLogger('invoice_to')
handler = RotatingFileHandler('invoice_to.log', maxBytes=1024*1024, backupCount=10)
if IS_DEVELOPMENT:
    logger.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.ERROR)


logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.DEBUG)
#logging.debug('This message should appear on the console')
#logging.info('So should this')
#logging.warning('And this, too')

'''



\Stripe\Stripe::setApiKey($stripe['secret_key']);
\Stripe\Stripe::setApiVersion("2016-07-06");
?>



'''