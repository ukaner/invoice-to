from . import BaseWorker
from sources.stripe_connect_source import StripeConnectSource
from models.stripe_connect import StripeConnectModel
from utilities import *

class StripeConnectWorker(BaseWorker):

    def __init__(self, *args):
        super(StripeConnectWorker, self).__init__(*[StripeConnectSource])