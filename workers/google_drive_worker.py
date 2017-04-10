from . import BaseWorker
import requests
from configuration import *
from utilities import *
from datetime import datetime
import json

class GoogleDriveWorker(BaseWorker):

    def __init__(self, *args):
        super(GoogleDriveWorker, self).__init__(*[None])


    def get_files(self, access_token):


        params = {
            'access_token': access_token
        }
        headers = {
            'cache-control': 'no-cache'
        }
        response = requests.request('GET', GOOGLE_URL_DRIVE_LIST, headers=headers, params=params)

        if response.status_code == 200:
            response = json.loads(response.text)
            return response['items']
        else:
            return []
