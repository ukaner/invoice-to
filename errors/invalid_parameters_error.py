from constants.error_codes import *
from constants.error_messages import *
from . import BaseError

class InvalidParametersError(BaseError):
    def __init__(self):
        super(InvalidParametersError, self).__init__(*[ErrorCodes.INVALID_PARAMETERS, ErrorMessages.INVALID_PARAMETERS])