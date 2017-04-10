from . import BaseSource
from configuration import *
from models.stripe_connect import StripeConnectModel

class StripeConnectSource(BaseSource):
    def __init__(self, *args):
        super(StripeConnectSource, self).__init__(*[db.stripe_connections, StripeConnectModel, '_id'])