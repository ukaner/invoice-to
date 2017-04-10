from . import BaseSource
from configuration import *
from models.user import UserModel
from errors.mongo_get_error import *

class UserSource(BaseSource):
    def __init__(self, *args):
        super(UserSource, self).__init__(*[db.users, UserModel, '_id'])

    def get_by_email(self, email):

        try:

            item = self.collection.find_one({'email': email})
            if item:
                item = self.model().from_json(item)
            return item
        except:
            raise MongoGetError()