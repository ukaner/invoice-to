from . import BaseHandler
from utilities.authentication_interceptor import *
from errors.invalid_parameters_error import *
from constants.success_codes import *
from workers.mailgun_worker import MailgunWorker


class MailHandler(BaseHandler):

    #@interceptor(authenticate())
    def get(self, mail_id):

        if not mail_id:
            result = MailgunWorker().get_all()
        else:
            result = MailgunWorker().get(mail_id)

        self.write(self.wrapResult(result, SuccessCodes.DEFAULT, ''))

    def post(self, *args, **kwargs):
        payload = self.get_payload_as_json()

        if 'inv_id' not in payload \
                or 'mail_from' not in payload \
                or 'mail_to' not in payload \
                or 'subject' not in payload \
                or 'html_body' not in payload:
            raise InvalidParametersError()

        inv_id = payload['inv_id']
        mail_from = payload['mail_from']
        mail_to = payload['mail_to']
        subject = payload['subject']
        html_body = payload['html_body']

        result = MailgunWorker().send_mail(inv_id, mail_from, mail_to, subject, html_body)
        self.write(self.wrapResult(result, SuccessCodes.DEFAULT, ''))

    # @interceptor(authenticate())
    def delete(self, mail_id):

        if not mail_id:
            raise InvalidParametersError()

        result = MailgunWorker().delete(mail_id)
        self.write(self.wrapResult(None, SuccessCodes.DEFAULT, ''))