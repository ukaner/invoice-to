from . import BaseHandler
from utilities.authentication_interceptor import *
from errors.invalid_parameters_error import *
from constants.stripe_operations import *
from workers.stripe_worker import StripeWorker
from constants.stripe_operations import *


class StripeConnectHandler(BaseHandler):

    def post(self, *args, **kwargs):

        payload = self.get_payload_as_json()

        if 'code' not in payload:
            raise InvalidParametersError()

        code = payload['code']
        result = StripeWorker().connect(code)
        self.write(self.wrapResult(result, StripeOperations.SUCCEEDED, ''))