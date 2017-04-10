from . import BaseSource
from configuration import *
from models.session import SessionModel

class SessionSource(BaseSource):
    def __init__(self, *args):
        super(SessionSource, self).__init__(*[db.sessions, SessionModel, '_id'])

    def get_user_session(self, user):

        if not user or not  user.id or user.id == '':
            return None

        item = self.collection.find_one({'user_id': user.id})
        if item:
            item = self.model().from_json(item)
        return item

    def get_session_by_token(self, token):

        if not token or token == '':
            return None

        item = self.collection.find_one({'token': token})
        if item:
            item = self.model().from_json(item)
        return item