from constants.error_codes import *
from constants.error_messages import *
from . import BaseError

class MongoUpdateError(BaseError):
    def __init__(self):
        super(MongoUpdateError, self).__init__(*[ErrorCodes.MONGO_UPDATE, ErrorMessages.MONGO_UPDATE])