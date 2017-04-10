import functools
import threading


class BaseWorker(object):

    def __init__(self, *args):

        self.source = None

        if len(args) > 0:
            self.source = args[0]

    def get_all(self):
        return self.source().get_all()

    def get(self, item_id):
        return self.source().get(item_id)

    def add(self, model):
        return self.source().add(model)

    def delete(self, item_id):
        return self.source().delete(item_id)

    def update(self, model):
        return self.source().update(model)



    def run_async(func):
        @functools.wraps(func)
        def function_in_a_thread(*args, **kwargs):
            func_t = threading.Thread(target=func, args=args, kwargs=kwargs)
            func_t.start()
        return function_in_a_thread
