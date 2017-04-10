from . import BaseWorker
from sources.session_source import SessionSource

class SessionWorker(BaseWorker):

    def __init__(self, *args):
        super(SessionWorker, self).__init__(*[SessionSource])

    def get_user_session(self, user):
        return SessionSource().get_user_session(user)

    def get_session_by_token(self, token):
        return SessionSource().get_session_by_token(token)
