from pymongo import MongoClient
import json
import sys
import codecs
from os import path
import re
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
from models.invoice import InvoiceModel
from models.mailgun_response import MailgunResponseModel
from sources.invoice_source import InvoiceSource
from sources.mailgun_response_source import MailgunResponseSource


client = MongoClient('ds147520.mlab.com', 47520)
db = client['heroku_tcdt1gjw']
db.authenticate('heroku_2xkdc8tx', 'kg8j7jui9qjsts2p759kc05f7m')


client_live = MongoClient('ds015335.mlab.com', 15335)
db_live = client_live['heroku_2xkdc8xt']
db_live.authenticate('heroku_2xkdc8tx', 'kg8j7jui9qjsts2p759kc05f7m')

client_dev = MongoClient('ds029476.mlab.com', 29476)
db_dev = client_dev['heroku_1tf3zq3v']
db_dev.authenticate('heroku_2xkdc8tx', 'kg8j7jui9qjsts2p759kc05f7m')


invoices = list(db_live.invoices.find({}))
for ind in range(len(invoices)):
    print(ind)

    invoice = invoices[ind]
    model = InvoiceModel()
    model.id = str(invoice['_id'])
    model.items = []
    model.currency = invoice.get('currency','')
    model.invNumber = invoice.get('invNumber','')
    model.invId = invoice.get('invId','')
    model.invBy = invoice.get('invBy','')
    model.invByName = invoice.get('invByName','')
    model.invDate = invoice.get('invDate','')
    model.invTo = invoice.get('invTo','')
    model.invFor = invoice.get('invFor','')
    model.invRef = invoice.get('invRef','')
    model.invTerms = invoice.get('invTerms','')
    model.dueDate = invoice.get('dueDate','')
    model.paymentDate = invoice.get('paymentDate',0)
    model.payDetails = invoice.get('payDetails','')
    model.vatp = invoice.get('dueDate',0)
    model.paid = invoice.get('paid', False)
    model.sixRule = False
    model.stripe = {
        'spk':invoice.get('spk',''),
        'at':invoice.get('at',''),
        'su':invoice.get('su','')
    }
    model.totalPrice = invoice.get('totalPrice', 0)

    rowCount = invoice.get('rowCount', 0)
    for i in range(rowCount):
        item = {}
        item['description'] = invoice.get('itemDesc' + str(i + 1), '')
        item['unit'] = invoice.get('itemHour' + str(i + 1), 0)
        item['price'] = invoice.get('itemPrice' + str(i + 1), 0)
        model.items.append(item)

    db_live.invoicesv2.save(model.to_json(include_id=True))
    #InvoiceSource().add(model)

    sender_email = invoice.get('sender_email','')
    receiver_email = invoice.get('receiver_email', '')

    if sender_email != '' and receiver_email != '':
        response = MailgunResponseModel()
        response.sender_email = sender_email
        response.receiver_email = receiver_email
        response.inv_id = model.invId
        #MailgunResponseSource().add(response)
        db_live.mailgun_responsesv2.save(model.to_json(include_id=True))


'''
invoices = list(db.invoices_old.find({}))
for invoice in invoices:
    model = InvoiceModel()
    model.id = str(invoice['_id'])
    model.items = []
    model.currency = invoice.get('currency','')
    model.invNumber = invoice.get('invNumber','')
    model.invId = invoice.get('invId','')
    model.invBy = invoice.get('invBy','')
    model.invByName = invoice.get('invByName','')
    model.invDate = invoice.get('invDate','')
    model.invTo = invoice.get('invTo','')
    model.invFor = invoice.get('invFor','')
    model.invRef = invoice.get('invRef','')
    model.invTerms = invoice.get('invTerms','')
    model.dueDate = invoice.get('dueDate','')
    model.paymentDate = invoice.get('paymentDate',0)
    model.payDetails = invoice.get('payDetails','')
    model.vatp = invoice.get('dueDate',0)
    model.paid = invoice.get('paid', False)
    model.sixRule = False
    model.stripe = {
        'spk':invoice.get('spk',''),
        'at':invoice.get('at',''),
        'su':invoice.get('su','')
    }
    model.totalPrice = invoice.get('totalPrice', 0)

    rowCount = invoice.get('rowCount', 0)
    for i in range(rowCount):
        item = {}
        item['description'] = invoice.get('itemDesc' + str(i + 1), '')
        item['unit'] = invoice.get('itemHour' + str(i + 1), 0)
        item['price'] = invoice.get('itemPrice' + str(i + 1), 0)
        model.items.append(item)

    db.invoices.save(model.to_json(include_id=True))
    #InvoiceSource().add(model)

    sender_email = invoice.get('sender_email','')
    receiver_email = invoice.get('receiver_email', '')

    if sender_email != '' and receiver_email != '':
        response = MailgunResponseModel()
        response.sender_email = sender_email
        response.receiver_email = receiver_email
        response.inv_id = model.invId
        #MailgunResponseSource().add(response)
        db.mailgun_responses.save(model.to_json(include_id=True))
'''