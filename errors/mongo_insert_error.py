from constants.error_codes import *
from constants.error_messages import *
from . import BaseError

class MongoInsertError(BaseError):
    def __init__(self):
        super(MongoInsertError, self).__init__(*[ErrorCodes.MONGO_INSERT, ErrorMessages.MONGO_INSERT])