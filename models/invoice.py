from . import BaseModel


class InvoiceModel(BaseModel):

    def __init__(self, *args):
        super(InvoiceModel, self).__init__(*args)

        self.items = []
        self.currency = ''
        self.invNumber = ''
        self.invId = ''
        self.invBy = ''
        self.invByName = ''
        self.invDate = 0
        self.invTo = ''
        self.invFor = ''
        self.invRef = ''
        self.invTerms = ''
        self.dueDate = 0
        self.paymentDate = 0
        self.payDetails = ''
        self.vatp = 0
        self.paid = False
        self.sixRule = False
        self.stripe = {}
        self.totalPrice = 0

    def to_json(self, include_id=True):

        item = {
            'items': self.items,
            'currency': self.currency,
            'invNumber': self.invNumber,
            'invId': self.invId,
            'invBy': self.invBy,
            'invByName': self.invByName,
            'invDate': self.invDate,
            'invTo': self.invTo,
            'invFor': self.invFor,
            'invRef': self.invRef,
            'invTerms': self.invTerms,
            'dueDate': self.dueDate,
            'paymentDate': self.paymentDate,
            'payDetails': self.payDetails,
            'vatp': self.vatp,
            'paid': self.paid,
            'sixRule': self.sixRule,
            'stripe': self.stripe,
            'totalPrice': self.totalPrice

        }

        if include_id:
            if type(self.id) == str:
                item['id'] = self.id
            else:
                item['id'] = str(self.id)

        return item

    def from_json(self, item):

        self.id = ''

        if '_id' in item:
            self.id = item['_id']
        elif 'id' in item:
            self.id = item['id']

        if self.id and type(self.id) != str:
            self.id = str(self.id)

        self.items = item.get('items',[])
        self.currency = item.get('currency', '')
        self.invId = item.get('invId', '')
        self.invNumber = item.get('invNumber', '')
        self.invBy = item.get('invBy', '')
        self.invByName = item.get('invByName', '')
        self.invDate = item.get('invDate', 0)
        self.invTo = item.get('invTo', '')
        self.invFor = item.get('invFor', '')
        self.invRef = item.get('invRef', '')
        self.invTerms = item.get('invTerms', '')
        self.dueDate = item.get('dueDate', 0)
        self.paymentDate = item.get('paymentDate', 0)
        self.payDetails = item.get('payDetails', '')
        self.vatp = item.get('vatp', 0)
        self.paid = item.get('paid', 0)
        self.sixRule = item.get('sixRule', 0)
        self.totalPrice = item.get('totalPrice', 0)
        self.stripe = item.get('stripe', {'spk':'', 'at':'', 'su':''})
            
        return self