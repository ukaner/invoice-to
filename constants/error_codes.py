from enum import Enum

class ErrorCodes(Enum):

    DEFAULT = 400
    UNAUTHORIZED = 401

    INVALID_PARAMETERS = 402

    MONGO_GET = 420
    MONGO_INSERT = 421
    MONGO_DELETE = 422
    MONGO_UPDATE = 423