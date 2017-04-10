from tornado.httpserver import HTTPServer
import tornado.web
from tornado.options import define, options
from tornado.ioloop import IOLoop
from handlers.user_handler import UserHandler
from handlers.invoice_handler import InvoiceHandler
from handlers.mail_handler import MailHandler
from handlers.stripe_connect_handler import StripeConnectHandler
from handlers.stripe_charge_handler import StripeChargeHandler
from tornado.netutil import bind_unix_socket

define("port", default=8400, help="run on the given port", type=int)
define('unix_socket', group='webserver', default=None, help='Path to unix socket to bind')

settings = {
    "debug": True,
    "cookie_secret": "__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
    "xsrf_cookies": False
}

if __name__ == '__main__':

    options.parse_command_line()

    app = tornado.web.Application([

        (r"/api/user/?([^/]*)", UserHandler),
        (r"/api/invoice/?([^/]*)", InvoiceHandler),
        (r"/api/mail/?([^/]*)", MailHandler),
        (r"/api/stripe/connect", StripeConnectHandler),
        (r"/api/stripe/charge", StripeChargeHandler)
    ], **settings)

    if options.unix_socket:
        server = HTTPServer(app)
        socket = bind_unix_socket(options.unix_socket)
        server.add_socket(socket)
    else:
        server = HTTPServer(app)
        server.listen(options.port)

    IOLoop.instance().start()
