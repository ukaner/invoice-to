from . import BaseWorker
import requests
from configuration import *
from utilities import *
from datetime import datetime
import json

class GoogleCalendarWorker(BaseWorker):

    def __init__(self, *args):
        super(GoogleCalendarWorker, self).__init__(*[None])


    def get_events(self, access_token, email):

        #self.insert_event(access_token, email, email)

        params = {
            'access_token': access_token
        }
        headers = {
            'cache-control': 'no-cache'
        }
        response = requests.request('GET', GOOGLE_URL_EVENT_LIST.format(email), headers=headers, params=params)

        if response.status_code == 200:
            response = json.loads(response.text)
            return response['items']
        else:
            return []

    def insert_event(self, access_token, email, attendee_email):

        start_value = datetime.fromtimestamp(getCurrentTimeInt() + 24 * 60 * 60).strftime('%Y-%m-%dT%H:%M:%S+0000')
        end_value = datetime.fromtimestamp(getCurrentTimeInt() + 25 * 60 * 60).strftime('%Y-%m-%dT%H:%M:%S+0000')
        event = {
            'end': {
                'dateTime': end_value
            }
        }

        '''
        'summary': 'Invoice.to Test',
        'location': 'Invoice.to Test Location',
        'description': 'Invoice.to Test Description',
        'start': {
            'dateTime': start
        },
        ,
        'attendees': [
            {'email': attendee_email}
        ],
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10},
            ]
        }
        '''

        headers = {
            'cache-control': 'no-cache',
            'Authorization': 'Bearer ' + access_token
        }

        event = json.dumps(event)
        response = requests.post(GOOGLE_URL_EVENT_LIST.format(email), data=event, headers = headers)



        if response.status_code == 200:
            response = json.loads(response.text)
            return response['items']
        else:
            return []