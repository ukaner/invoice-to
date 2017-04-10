from . import BaseWorker
import requests
from configuration import *
from utilities import *
from datetime import datetime
import json

class GoogleContactsWorker(BaseWorker):

    def __init__(self, *args):
        super(GoogleContactsWorker, self).__init__(*[None])


    def get_contacts(self, access_token, email):


        params = {
            'access_token': access_token
        }
        headers = {
            'cache-control': 'no-cache'
        }
        response = requests.request('GET', GOOGLE_URL_CONTACTS_LIST.format(email), headers=headers, params=params)

        if response.status_code == 200:
            return response.text
        else:
            return ''
