from constants.error_codes import ErrorCodes
from constants.error_messages import ErrorMessages
from tornado import web
from enum import Enum


class BaseError(web.HTTPError):
    def __init__(self, *args):

        self.status_code = ErrorCodes.DEFAULT
        self.reason = ErrorMessages.DEFAULT
        self.log_message = ErrorMessages.DEFAULT

        if len(args) > 0:
            self.status_code = args[0]
        if len(args) > 1:
            self.reason = args[1]
            self.log_message = args[1]

        if isinstance(self.status_code, Enum):
            self.status_code = self.status_code.value

        if isinstance(self.reason, Enum):
            self.reason = self.reason.value

        if isinstance(self.log_message, Enum):
            self.log_message = self.log_message.value
