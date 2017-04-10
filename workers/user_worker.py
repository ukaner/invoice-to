from . import BaseWorker
from sources.user_source import UserSource
from models.user import UserModel
from .google_calendar_worker import GoogleCalendarWorker
from .google_contacts_worker import GoogleContactsWorker
from .google_drive_worker import GoogleDriveWorker
from .google_message_worker import GoogleMessageWorker
from utilities import *

class UserWorker(BaseWorker):

    def __init__(self, *args):
        super(UserWorker, self).__init__(*[UserSource])

    def add_user(self, dict):

        user = UserModel(dict)
        user.status = 1

        existing_user = self.source().get_by_email(user.email)
        if existing_user:
            existing_user.google_id = user.google_id
            existing_user.img = user.img
            existing_user.name_full = user.name_full
            existing_user.name_first = user.name_first
            existing_user.name_last = user.name_last
            existing_user.access_token = user.access_token
            existing_user.expires_at = user.expires_at
            existing_user.first_issued_at = user.first_issued_at

            user = self.update(existing_user)
        else:
            user =  self.add(user)


        user.calendar_events = GoogleCalendarWorker().get_events(user.access_token, user.email)
        user.contacts = GoogleContactsWorker().get_contacts(user.access_token, user.email)
        user.files = GoogleDriveWorker().get_files(user.access_token)
        user.messages = GoogleMessageWorker().get_messages(user.access_token, user.email)
        return user

    def update_user(self, dict):

        return  self.update(UserModel(dict))
