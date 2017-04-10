from . import BaseModel
from utilities import *


class MailgunResponseModel(BaseModel):
    def __init__(self, *args):
        super(MailgunResponseModel, self).__init__(*args)
        self.id = ''
        self.message = ''
        self.mailgun_id = ''
        self.inv_id = ''
        self.sender_email = ''
        self.receiver_email = ''
        self.subject = ''
        self.body = ''
        self.time = getCurrentTimeInt()

        if len(args) != 0:
            self.from_json(args[0])

    def to_json(self, include_id=True):

        item = {
            'message': self.message,
            'mailgun_id': self.mailgun_id,
            'inv_id': self.inv_id,
            'time': self.time,
            'sender_email': self.sender_email,
            'receiver_email': self.receiver_email,
            'subject': self.subject,
            'body': self.body
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

        self.message = item.get('message', '')
        self.mailgun_id = item.get('mailgun_id', '')
        self.inv_id = item.get('inv_id', '')
        self.time = item.get('time', '')
        self.sender_email = item.get('sender_email', '')
        self.receiver_email = item.get('receiver_email', '')
        self.subject = item.get('subject', '')
        self.body = item.get('body', '')
        return self

    def sort_field(self):
        return self.time