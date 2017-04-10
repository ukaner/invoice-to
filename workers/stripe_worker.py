from utilities import *
import stripe
from configuration import *
from errors import *
import json
from . import BaseWorker
from .invoice_worker import InvoiceWorker
from constants.stripe_operations import *
from .stripe_connect_worker import StripeConnectWorker
from models.stripe_connect import StripeConnectModel

class StripeWorker(BaseWorker):

    def __init__(self, *args):
        super(StripeWorker, self).__init__()

        stripe.api_key = STRIPE_SECRET_KEY
        stripe.api_version = STRIPE_API_VERSION

    def connect(self, code):

        data = dict()
        data['client_secret'] = STRIPE_SECRET_KEY
        data['code'] = code
        data['grant_type'] = 'authorization_code'

        response = post(url=STRIPE_TOKEN_URL, payload=data)
        if response.status_code == 200:


            content = json.loads(response.content.decode('utf-8'))

            stripe_connect = StripeConnectModel()
            stripe_connect.access_token = content['access_token']
            stripe_connect.stripe_publishable_key = content['stripe_publishable_key']
            stripe_connect.stripe_user_id = content['stripe_user_id']
            stripe_connect = StripeConnectWorker().add(stripe_connect)

            InvoiceWorker().update_access_tokens_and_publishable_keys(stripe_connect.stripe_user_id, stripe_connect.access_token, stripe_connect.stripe_publishable_key)
            return stripe_connect
        else:

            resp = json.loads(response.text)
            resp_text = resp['error'] + ' : ' + resp['error_description']

            error = BaseError()
            error.status_code = response.status_code
            error.reason = resp_text
            error.log_message = resp_text
            raise error

    def charge(self, invoice_id, stripe_token):

        invoice = InvoiceWorker().get_invoice(invoice_id)


        stripe.api_key = invoice.stripe['at']

        try:

            customer = stripe.Customer.create(
                description = "Customer for {0}".format(stripe_token['email']),
                source=stripe_token['id'])

            charge = stripe.Charge.create(
                amount = invoice.totalPrice * 100,
                currency = get_currency(invoice.currency),
                customer = customer.id,
            )

            if charge.paid:
                invoice.paid = 1
                invoice.paymentDate = charge.created

                return InvoiceWorker().update(invoice)
            else:
                return StripeOperations.FAILED


        except stripe.CardError as e:

            error = BaseError()
            error.status_code = e.code
            error.reason = 'Error #1: Card Error'
            error.log_message = error.reason
            raise error

        except stripe.InvalidRequestError as e:

            error = BaseError()
            error.status_code = e.http_status
            error.reason = 'Error #2: Invalid parameters were supplied to Stripe API'
            error.log_message = error.reason
            raise error

        except stripe.AuthenticationError as e:

            error = BaseError()
            error.status_code = e.http_status
            error.reason = 'Error #3: Authentication with Stripe API failed'
            error.log_message = error.reason
            raise error

        except stripe.APIConnectionError as e:

            error = BaseError()
            error.status_code = e.http_status
            error.reason = 'Error #4: Network communication with Stripe failed'
            error.log_message = error.reason
            raise error

        except stripe.StripeError as e:

            error = BaseError()
            error.status_code = e.http_status
            error.reason = e._message
            error.log_message = error.reason
            raise error

        except Exception as e:

            error = BaseError()
            raise error


