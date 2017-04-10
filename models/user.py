from . import BaseModel
from utilities import *

class UserModel(BaseModel):
    def __init__(self, *args):
        super(UserModel, self).__init__(*args)

        self.id = ''
        self.google_id = ''
        self.img = ''
        self.email = ''
        self.name_full = ''
        self.name_first = ''
        self.name_last = ''
        self.access_token = ''
        self.expires_at = 0
        self.first_issued_at = 0
        self.calendar_events = []
        self.contacts = []
        self.files = []
        self.messages = []

        self.status = int(1)
        self.creation_date = getCurrentTimeInt()

        if len(args) != 0:
            self.from_json(args[0])

    def to_json(self, include_id=True):
        item = {
            'google_id': self.google_id,
            'img': self.img,
            'email': self.email,
            'name_full': self.name_full,
            'name_first': self.name_first,
            'name_last': self.name_last,
            'access_token': self.access_token,
            'expires_at': self.expires_at,
            'first_issued_at': self.first_issued_at,
            'status': self.status,
            'creation_date': self.creation_date,

            'calendar_events': self.calendar_events,
            'contacts': self.contacts,
            'files': self.files,
            'messages': self.messages
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

        self.google_id = item.get('google_id', '')
        self.img = item.get('img', '')
        self.email = item.get('email', '')
        self.name_full = item.get('name_full', '')
        self.name_first = item.get('name_first', '')
        self.name_last = item.get('name_last', '')
        self.access_token = item.get('access_token', '')
        self.expires_at = item.get('expires_at', '')
        self.first_issued_at = item.get('first_issued_at', '')
        self.status = item.get('status', 1)
        self.creation_date = item.get('creation_date', getCurrentTimeInt())

        self.calendar_events = item.get('calendar_events',[])
        self.contacts = item.get('contacts',[])
        self.files = item.get('files',[])
        self.messages = item.get('messages', [])

        return self

    def sort_field(self):
        return self.email
