from . import BaseSource
from configuration import *
from models.mailgun_response import MailgunResponseModel

class MailgunResponseSource(BaseSource):
    def __init__(self, *args):
        super(MailgunResponseSource, self).__init__(*[db.mailgun_responses, MailgunResponseModel, '_id'])