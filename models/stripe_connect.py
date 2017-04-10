from . import BaseModel
from utilities import *


class StripeConnectModel(BaseModel):
    def __init__(self, *args):
        super(StripeConnectModel, self).__init__(*args)
        self.id = ''
        self.access_token = ''
        self.stripe_publishable_key = ''
        self.stripe_user_id = ''
        self.time = getCurrentTimeInt()

        if len(args) != 0:
            self.from_json(args[0])

    def to_json(self, include_id=True):

        item = {
            'access_token': self.access_token,
            'stripe_publishable_key': self.stripe_publishable_key,
            'stripe_user_id': self.stripe_user_id,
            'time': self.time
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

        self.access_token = item.get('access_token', '')
        self.stripe_publishable_key = item.get('stripe_publishable_key', '')
        self.stripe_user_id = item.get('stripe_user_id', '')
        self.time = item.get('time', '')
        return self

    def sort_field(self):
        return self.stripe_user_id
