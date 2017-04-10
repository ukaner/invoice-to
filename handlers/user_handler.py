from . import BaseHandler
from utilities.authentication_interceptor import *
from errors.invalid_parameters_error import *
from constants.success_codes import *

#@interceptor(authenticate())
class UserHandler(BaseHandler):
    def get(self, user_id):


        if not user_id:
            result = UserWorker().get_all()
        else:
            result = UserWorker().get(user_id)

        self.write(self.wrapResult(result, SuccessCodes.DEFAULT, ''))

    def post(self, *args, **kwargs):
        payload = self.get_payload_as_json()

        if 'google_id' not in payload \
                or 'img' not in payload \
                or 'email' not in payload \
                or 'name_full' not in payload \
                or 'name_first' not in payload \
                or 'name_last' not in payload \
                or 'access_token' not in payload \
                or 'expires_at' not in payload \
                or 'first_issued_at' not in payload:
            raise InvalidParametersError()

        result = UserWorker().add_user(payload)
        self.write(self.wrapResult(result, SuccessCodes.DEFAULT, ''))

    def delete(self, user_id):

        if not user_id:
            raise InvalidParametersError()

        result = UserWorker().delete(user_id)
        self.write(self.wrapResult(None, SuccessCodes.DEFAULT, ''))