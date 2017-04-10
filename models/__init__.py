from bson.objectid import *

class BaseModel(object):

    def __init__(self, *args):
        if len(args) != 0:
            self.data = args[0]


    def update_id(self, item_id):
        if type(item_id) != str:
            item_id = str(item_id)

        self.id = item_id

    def get_object_id(self):
        return ObjectId(self.id)

