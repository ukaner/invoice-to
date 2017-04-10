from . import BaseSource
from configuration import *
from models.invoice import InvoiceModel
from bson.objectid import ObjectId

class InvoiceSource(BaseSource):
    def __init__(self, *args):
        super(InvoiceSource, self).__init__(*[db.invoices, InvoiceModel, '_id'])

    def get_invoice(self, inv_id):

        item = self.collection.find_one({'invId': inv_id})
        if item:
            item = self.model().from_json(item)
            return item

        return self.get(inv_id)

    def get_invoice_by_stripe_user_id(self, stripe_user_id):
        items = self.collection.find({'stripe.su': stripe_user_id})
        if items:
            items = [self.model().from_json(x) for x in items]
        return items