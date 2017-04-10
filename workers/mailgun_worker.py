from . import BaseWorker
from sources.mailgun_response_source import MailgunResponseSource
from models.mailgun_response import MailgunResponseModel
from utilities import *
from errors import *
import json

class MailgunWorker(BaseWorker):

    def __init__(self, *args):
        super(MailgunWorker, self).__init__(*[MailgunResponseSource])

    def send_mail(self, inv_id, mail_from, mail_to, subject, html_body):

        response = send_mailgun_message(mail_from=mail_from, mail_to=mail_to, subject=subject, text=None, html_body= html_body)
        if response.status_code == 200:
            content = json.loads(response.content.decode('utf-8'))
            response_model = MailgunResponseModel()
            response_model.mailgun_id =  content['id']
            response_model.message = content['message']
            response_model.inv_id = inv_id
            response_model.sender_email = mail_from
            response_model.receiver_email = mail_to
            return  self.add(response_model)
        else:
            error = BaseError()
            error.status_code = response.status_code
            error.reason = json.loads(response.text)['message']
            error.log_message = error.reason
            raise error


