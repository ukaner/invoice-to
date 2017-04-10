import calendar
import uuid
import hashlib
from configuration import *
from bson.objectid import ObjectId
import requests
import pycurl
import io

def getCurrentTimeInt():
    return int(calendar.timegm(time.gmtime()))


def hash_password(password):
    salt = uuid.uuid4().hex
    return hashlib.sha256(salt.encode() + password.encode()).hexdigest() + ':' + salt

def check_password(hashed_password, user_password):
    password, salt = hashed_password.split(':')
    return password == hashlib.sha256(salt.encode() + user_password.encode()).hexdigest()

def create_object_id():
    return ObjectId()


def send_mailgun_message(mail_from, mail_to, subject, text, html_body):

    url = MAILGUN_URL.format(MAILGUN_DOMAIN)
    auth = ('api', MAILGUN_KEY)
    data = {
        'from': mail_from,
        'to': mail_to,
        'subject': subject,
        'text': text,
        'html': html_body
    }

    return requests.post(url, auth=auth, data=data)


def post(url, payload):
    return requests.post(url, data=payload)

def postPyCurl(url, headers, payload):
    url = url.encode('utf-8')
    buf = io.BytesIO()
    c = pycurl.Curl()
    c.setopt(c.URL, url)
    c.setopt(c.CONNECTTIMEOUT, 5)
    c.setopt(c.TIMEOUT, 8)
    c.setopt(c.COOKIEFILE, '')
    c.setopt(c.FAILONERROR, True)
    c.setopt(c.HTTPHEADER, headers)
    c.setopt(c.WRITEFUNCTION, buf.write)
    c.setopt(c.ENCODING, 'gzip,deflate')
    c.setopt(c.POSTFIELDS, payload)
    c.perform()

    text = buf.getvalue()
    buf.close()
    return text


def get_currency(symbol):

    if symbol == '$':
        return 'usd'

    if symbol == '€':
        return 'eur'

    if symbol == '£':
        return 'gbp'

    return symbol
