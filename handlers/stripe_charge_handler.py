from . import BaseHandler
from utilities.authentication_interceptor import *
from errors.invalid_parameters_error import *
from constants.stripe_operations import *
from workers.stripe_worker import StripeWorker
from constants.stripe_operations import *
from constants.mongo_operations import *


class StripeChargeHandler(BaseHandler):

    def post(self, *args, **kwargs):

        payload = self.get_payload_as_json()

        if 'invoice_id' not in payload:
            raise InvalidParametersError()

        if 'token' not in payload:
            raise InvalidParametersError()

        invoice_id = payload['invoice_id']
        stripe_token = payload['token']

        result = StripeWorker().charge(invoice_id, stripe_token)
        self.write(self.wrapResult(result, StripeOperations.SUCCEEDED, ''))