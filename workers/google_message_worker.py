from . import BaseWorker
import requests
from configuration import *
from utilities import *
from datetime import datetime
import json
import base64
from email.mime.audio import MIMEAudio
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import mimetypes
import os

class GoogleMessageWorker(BaseWorker):

    def __init__(self, *args):
        super(GoogleMessageWorker, self).__init__(*[None])


    def get_messages(self, access_token, email):

        self.send_message(access_token, email)

        params = {
            'access_token': access_token
        }
        headers = {
            'cache-control': 'no-cache'
        }
        response = requests.request('GET', GOOGLE_URL_MESSAGE_LIST.format(email), headers=headers, params=params)

        if response.status_code == 200:
            response = json.loads(response.text)
            return response['messages']
        else:
            return []

    def send_message(self, access_token, email):

        headers = {
            'cache-control': 'no-cache',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }

        messsage = self.create_message('onurak@gmail.com','onurak@gmail.com', 'subject', 'message_text')
        messsage = json.dumps(messsage)
        response = requests.post(GOOGLE_URL_MESSAGE_SEND.format(email), data=messsage, headers=headers)

        if response.status_code == 200:
            return response
        else:
            return []


    def create_message(self, sender, to, subject, message_text):
      message = MIMEText(message_text)
      message['to'] = to
      message['from'] = sender
      message['subject'] = subject
      message = message.as_string().encode('ascii')
      return {'raw': base64.urlsafe_b64encode(message).decode('ascii')}
