from . import BaseModel
from utilities import *


class SessionModel(BaseModel):
    def __init__(self, *args):
        super(SessionModel, self).__init__(*args)
        self.id = ''
        self.user_id = ''
        self.token = ''
        self.expiration = getCurrentTimeInt()

        if len(args) != 0:
            self.from_json(args[0])

    def to_json(self, include_id=True):

        item = {
            'user_id': self.user_id,
            'token': self.token,
            'expiration': self.expiration
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

        self.user_id = item.get('user_id', '')
        self.token = item.get('token', '')
        self.expiration = item.get('expiration', '')
        return self

    def sort_field(self):
        return self.expiration