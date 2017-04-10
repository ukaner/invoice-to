from constants.error_codes import *
from constants.error_messages import *
from . import BaseError

class MongoGetError(BaseError):
    def __init__(self):
        super(MongoGetError, self).__init__(*[ErrorCodes.MONGO_GET, ErrorMessages.MONGO_GET])