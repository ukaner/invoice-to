from constants.error_codes import *
from constants.error_messages import *
from . import BaseError

class MongoDeleteError(BaseError):
    def __init__(self):
        super(MongoDeleteError, self).__init__(*[ErrorCodes.MONGO_DELETE, ErrorMessages.MONGO_DELETE])