from errors.authorization_error import AuthorizationError
from workers.session_worker import SessionWorker
from workers.user_worker import UserWorker

def authenticate():
    def wrapper(self, transforms, *args, **kwargs):

        request = self.request
        token = request.headers.get('x-access-token')

        if not token:
            return False

        session_model = SessionWorker().get_session_by_token(token)

        user = None
        if session_model:
            user = UserWorker().get(session_model.user_id)
        if user:
            self.token = session_model.token
            self.user = user
            return True

        return False

    return wrapper


def interceptor(func):

    def class_wrapper(cls):

        def wrapper(old):

            def inner(self, transforms, *args, **kwargs):

                ret = True
                if func:
                    ret = func(self, transforms, *args, **kwargs)

                if ret:
                    old(self, transforms, *args, **kwargs)
                else:
                    self._transforms = transforms
                    self._unauthorized()

            return inner

        cls._execute = wrapper(cls._execute)
        return cls

    return class_wrapper

