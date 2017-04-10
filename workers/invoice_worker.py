from . import BaseWorker
from sources.invoice_source import InvoiceSource
from models.invoice import InvoiceModel
from utilities import *

class InvoiceWorker(BaseWorker):

    def __init__(self, *args):
        super(InvoiceWorker, self).__init__(*[InvoiceSource])

    def get_invoice(self, inv_id):
        return InvoiceSource().get_invoice(inv_id)

    def get_invoice_by_stripe_user_id(self, stripe_user_id):
        return self.source().get_invoice_by_stripe_user_id(stripe_user_id)

    def update_access_tokens_and_publishable_keys(self, stripe_user_id, access_token, stripe_publishable_key):

        old_invoices = InvoiceWorker().get_invoice_by_stripe_user_id(stripe_user_id)
        for invoice in old_invoices:
            if invoice.stripe['at'] != access_token or invoice.stripe['spk'] != stripe_publishable_key:
                invoice.stripe['at'] = access_token
                invoice.stripe['spk'] = stripe_publishable_key
                self.source().update(invoice)


    def add_invoice(self, dict):
        invoice = InvoiceModel().from_json(dict)
        invoice.invId = str(create_object_id())
        return self.add(invoice)

    def update_invoice(self, dict):
        invoice = InvoiceModel(dict)
        return  self.update(invoice)