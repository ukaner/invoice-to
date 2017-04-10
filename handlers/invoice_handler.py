from . import BaseHandler
from utilities.authentication_interceptor import *
from errors.invalid_parameters_error import *
from constants.success_codes import *
from workers.invoice_worker import InvoiceWorker

class InvoiceHandler(BaseHandler):
    def get(self, inv_id):

        if not inv_id:
            result = InvoiceWorker().get_all()
        else:
            result = InvoiceWorker().get_invoice(inv_id)


        self.write(self.wrapResult(result, SuccessCodes.DEFAULT, ''))

    def post(self, *args, **kwargs):
        payload = self.get_payload_as_json()

        if 'items' not in payload \
                or 'currency' not in payload \
                or 'invNumber' not in payload \
                or 'invBy' not in payload \
                or 'invByName' not in payload \
                or 'invDate' not in payload \
                or 'invTo' not in payload \
                or 'invFor' not in payload \
                or 'invRef' not in payload \
                or 'invTerms' not in payload \
                or 'dueDate' not in payload \
                or 'paymentDate' not in payload \
                or 'vatp' not in payload \
                or 'paid' not in payload \
                or 'sixRule' not in payload\
                or 'stripe' not in payload:
            raise InvalidParametersError()


        result = InvoiceWorker().add_invoice(payload)
        self.write(self.wrapResult(result, SuccessCodes.DEFAULT, ''))


    def put(self, *args, **kwargs):
        payload = self.get_payload_as_json()

        if 'id' not in payload \
                or 'items' not in payload \
                or 'currency' not in payload \
                or 'invId' not in payload \
                or 'invNumber' not in payload \
                or 'invBy' not in payload \
                or 'invByName' not in payload \
                or 'invDate' not in payload \
                or 'invTo' not in payload \
                or 'invFor' not in payload \
                or 'invRef' not in payload \
                or 'invTerms' not in payload \
                or 'dueDate' not in payload \
                or 'paymentDate' not in payload \
                or 'vatp' not in payload \
                or 'paid' not in payload \
                or 'sixRule' not in payload:
            raise InvalidParametersError()

        result = InvoiceWorker().update_invoice(payload)
        self.write(self.wrapResult(result, SuccessCodes.DEFAULT, ''))

    def delete(self, inv_id):

        if not inv_id:
            raise InvalidParametersError()

        result = InvoiceWorker().delete(inv_id)
        self.write(self.wrapResult(None, SuccessCodes.DEFAULT, ''))