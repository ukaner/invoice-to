from bson.objectid import *
from constants.mongo_operations import *
from errors.mongo_get_error import *
from errors.mongo_delete_error import *
from errors.mongo_insert_error import *
from errors.mongo_update_error import *


class BaseSource(object):

    def __init__(self, *args):

        self.collection = None
        self.model = None

        if len(args) > 0:
            self.collection = args[0]
        if len(args) > 1:
            self.model = args[1]
        if len(args) > 2:
            self.unique_field = args[2]

    def get_all(self):
        try:
            items = list(self.collection.find({}))
            if items:
                items = [self.model().from_json(x) for x in items]
            return items
        except:
            raise MongoGetError()

    def get(self, item_id):

        try:
            if type(item_id) == str:
                item_id = ObjectId(item_id)

            item = self.collection.find_one({'_id': item_id})
            if item:
                item = self.model().from_json(item)
            return item
        except:
            raise MongoGetError()

    def add(self, model):

        try:
            if model.id and model.id != '' and self.get(model.id):
                return None

            result = self.collection.insert_one(model.to_json(include_id=False))

            if result.inserted_id:
                model.update_id(result.inserted_id)
                return model
            else:
                raise MongoInsertError()
        except:
            raise MongoInsertError()

    def delete(self, item_id):

        try:
            if type(item_id) == str:
                item_id = ObjectId(item_id)

            result = self.collection.delete_one({'_id': item_id})
            if result.deleted_count == 1:
                return MongoOperations.SUCCEEDED
            else:
                raise MongoDeleteError()
        except:
            raise MongoDeleteError()

    def update(self, model):

        try:
            item_id = model.id
            if type(item_id) == str:
                item_id = ObjectId(item_id)

            result = self.collection.update_one({'_id': item_id},
                                                {'$set': model.to_json(include_id=False)})

            if result.matched_count == 1:
                return model
            else:
                raise MongoUpdateError()
        except:
            raise MongoUpdateError()
