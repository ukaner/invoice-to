from constants.error_codes import *
from constants.error_messages import *
from . import BaseError

class AuthorizationError(BaseError):
    def __init__(self):
        super(AuthorizationError, self).__init__(*[ErrorCodes.UNAUTHORIZED, ErrorMessages.UNAUTHORIZED])