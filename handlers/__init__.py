import tornado
import traceback
from enum import Enum
from configuration import *
from bson.json_util import dumps
from models import BaseModel
from datetime import datetime
from time import gmtime, strftime
import os
import json
import logging
from errors.authorization_error import *
try:
   import cPickle as pickle
except:
   import pickle

import jsonpickle


class BaseHandler(tornado.web.RequestHandler):

    def get_payload_as_json(self):
        payload = self.request.body.decode('utf-8')
        return json.loads(payload)

    def _unauthorized(self):

        self.finish(json.dumps({
            'error': {
                'code': ErrorCodes.UNAUTHORIZED.value,
                'message': ErrorMessages.UNAUTHORIZED.value,
            }
        }))

    def _raise_error(self, status_code, message):

        if isinstance(status_code, Enum):
            status_code = status_code.value

        if isinstance(message, Enum):
            message = message.value

        self.finish(json.dumps({
            'error': {
                'code': status_code,
                'message': message,
            }
        }))

    def write_error(self, status_code, **kwargs):

        if isinstance(status_code, Enum):
            status_code = status_code.value

        self.set_header('Content-Type', 'application/json')
        if self.settings.get("serve_traceback") and "exc_info" in kwargs:
            # in debug mode, try to send a traceback
            lines = []
            for line in traceback.format_exception(*kwargs["exc_info"]):
                lines.append(line)

            reason = self._reason
            if isinstance(reason, Enum):
                reason = reason.value
            self.finish(json.dumps({
                'error': {
                    'code': status_code,
                    'message': reason,
                    'traceback': lines,
                }
            }))
        else:

            reason = self._reason
            if isinstance(reason, Enum):
                reason = reason.value

            self.finish(json.dumps({
                'error': {
                    'code': status_code,
                    'message': reason,
                }
            }))


    def wrapResult(self, data, status, message):


        if isinstance(status, Enum):
            status = status.value

        if isinstance(message, Enum):
            message = message.value

        if type(data) is list and len(data) == 0:
            data = []
        elif not data and data != 0:
            data = {}
        elif type(data) is list:
            data = [json.loads(jsonpickle.encode(x, unpicklable=False)) for x in data]
        elif data.__class__.__base__ is BaseModel:
            data = data.to_json(include_id=True)

        if isinstance(status, Enum):
            status = status.value
        if isinstance(message, Enum):
            message = message.value

        return dumps({'data':data, 'result': {'status': status, 'message': message}})


    '''
    def wrapResult(self, data, status, message, total=None):

        count = 0
        if type(data) is list and len(data) == 0:
            data = []
            count = 0
        elif not data and data != 0:
            data = {}
            count = 0
        elif type(data) is list:
            data = [json.loads(jsonpickle.encode(x, unpicklable=False)) for x in data]
            count = len(data)
        elif data.__class__.__base__ is BaseModel:
            data = data.to_json(include_id=True)
            count = 1

        if not total:
            total = count
        return dumps({'data':data, 'total': total, 'result': {'status': status, 'message': message}})
    '''


    def set_default_headers(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
        self.set_header('Access-Control-Max-Age', 1000)
        self.set_header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-origin')

    @tornado.web.asynchronous
    def options(self, *args, **kwargs):
        self.preflight()
        self.finish()

    def preflight(self):
        if 'Origin' in self.request.headers:
            if self.verify_origin():
                #self.set_header('Access-Control-Allow-Origin', self.request.headers['Origin'])
                #self.set_header('Access-Control-Allow-Origin', *)
                #self.set_header('Access-Control-Allow-Credentials', 'true')
                #self.set_header('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS')

                self.set_header('Access-Control-Allow-Origin', '*')
                self.set_header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
                self.set_header('Access-Control-Max-Age', 1000)
                self.set_header('Access-Control-Allow-Headers',
                                'Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-origin')

                return True
            else:
                return False
        else:
            return True

    def verify_origin(self):
        # TODO: Verify origin
        return True
