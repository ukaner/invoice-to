from enum import Enum

class ErrorMessages(Enum):
    DEFAULT = 'Oops. Something went wrong. Please try again'
    UNAUTHORIZED = 'You are not authorized to perform this action'
    INVALID_PARAMETERS  = 'Please check parameters'

    STRIPE_CHARGE_FAILED = 'Charging with stripe failed, pleas try again.'


    MONGO_GET = 'Something went wrong while fetching items from mongo'
    MONGO_INSERT = 'Something went wrong while saving item to mongo'
    MONGO_DELETE = 'Something went wrong while deleting item from mongo'
    MONGO_UPDATE = 'Something went wrong while updating item at mongo'