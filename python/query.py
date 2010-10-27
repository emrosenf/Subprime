# -*- coding: utf-8 -*-
import logging

from pylons import request, response, session, tmpl_context as c, config
from pylons.controllers.util import abort, redirect_to
from datetime import datetime, timedelta
import time
from subprime.lib.base import *
import json
import re

log = logging.getLogger(__name__)

from subprime.model.classes import *
from subprime.model.meta import Session as Session_
from sqlalchemy import func, and_, case, Integer

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
         if isinstance(obj, Decimal):
             return str(round(obj,2))
         return json.JSONEncoder.default(self, obj)

class QueryController(BaseController):

    # Need to protect an entire controller?
    # Decorating __before__ protects all actions
    

    def __before__(self):
        c.callback = request.params.get('callback', 'callback')
        c.fields = request.params.get('fields', None)
        if c.fields:
            c.fields = c.fields.split(',')
            
        #filters
        c.sex = request.params.get('sex', None)
        c.race = request.params.get('race', None)
        c.state = request.params.get('state', None)
        c.county = request.params.get('county', None)
        
        c.group_by = request.params.get('group_by', None)
        if c.group_by:
            c.group_by = c.group_by.split(',')
        

    def lar(self):
        fields = []

        for i in range(len(c.fields)):
            field = c.fields[i]
            split = field.split('(')
            if len(split) == 1:
                fields.append(getattr(Lar, field))
            elif len(split) == 2:
                function = getattr(func, split[0])
                fields.append(function(getattr(Lar,split[1][:-1])))
                c.fields[i] = split[1][:-1]
        
        if not c.group_by:
            fields.append(Institution.respondent_name)
            c.fields.append("respondent_name")
            
        query = Session_.query(*fields)
        
        if not c.group_by:
            query = query.join((Institution, Institution.id==Lar.respondent_id))
        if c.sex:
            query = query.filter(Lar.sex==c.sex)
        if c.race:
            query = query.filter(Lar.race==c.race)
        if c.state:
            query = query.filter(Lar.state==c.state)
        if c.county:
            query = query.filter(Lar.county==c.county)
        
        if c.group_by:
            for group in c.group_by:
                query = query.group_by(getattr(Lar, group))
                
        b = query.all()
        res = []
        for tuple in b:
            tup = {}
            for i in range(len(c.fields)):
                tup[c.fields[i]] = tuple[i]
            res.append(tup)
        response.content_type = 'text/javascript'
        return ''.join([c.callback,"(",json.dumps(res, cls=DecimalEncoder),")"])
            

    def index(self):

        #Rate spread by state, county
        #a = Session_.query(Lar.state, Lar.county, func.avg(Lar.rate_spread)).group_by(Lar.state).group_by(Lar.county).all()
        #b = [{"state" : c[0], "county": c[1], "rate_spread" : str(round(c[2],2))} for c in a]
        
        #Rate spread by state
        #a = Session_.query(Lar.state, func.avg(Lar.rate_spread)).group_by(Lar.state).all()
        #b = [{"state" : c[0], "rate_spread" : str(round(c[1],2))} for c in a]
        
        #Income by state, county
        #a = Session_.query(Lar.state, Lar.county, func.avg(Lar.income)).group_by(Lar.state).group_by(Lar.county).all()
        #b = [{"state" : c[0], "county": c[1], "income" : str(round(c[2],2))} for c in a]
        
        #Income by state
        a = Session_.query(Lar.state, func.avg(Lar.income)).group_by(Lar.state).all()
        b = [{"state" : c[0], "income" : str(round(c[1],2))} for c in a]
        
        #Loan amount by state, county
        #a = Session_.query(Lar.state, Lar.county, func.avg(Lar.loan_amount)).group_by(Lar.state).group_by(Lar.county).all()
        #b = [{"state" : c[0], "county": c[1], "loan_amount" : str(round(c[2],2))} for c in a]
        
        #Loan amount by state
        #a = Session_.query(Lar.state, func.avg(Lar.loan_amount)).group_by(Lar.state).all()
        #b = [{"state" : c[0], "loan_amount" : str(round(c[1],2))} for c in a]
        
        return json.dumps(b, cls=DecimalEncoder)
        

    
    def transactions(self):
        c.title = "Transactions"
        c.transactions = Transaction.query.filter_by(user=c.user).all()
        return render('/account/transactions.mak')

    def affiliate(self):
        c.title = "Affiliate Dashboard"
        c.items = c.user.itemsAffiliate

        if len(c.items) > 0:
            nullToken = c.nullToken
            
            """Each row is (product_id, date, total, numReturns, numAffiliatePurchases """
            #JOIN was unnecessary
            #c.orders = Session_.query(Order.product_id, func.datediff(Order.date, c.lowerDate), func.count('*').label('total'), func.sum(Order.isReturned, type_=Integer).label('numReturns'), func.count(Order.affiliate_user_id).label('numAffiliatePurchases')).join((Product, and_(Order.affiliate_user_id==c.user.id, Order.product_id==Product.id))).filter(Order.date >= c.lowerDate).filter(Order.date < c.upperDate).group_by(Order.product_id).group_by(Order.date).all()
            c.orders = Session_.query(Order.product_id, func.datediff(Order.date, c.lowerDate), func.count('*').label('total'), func.sum(Order.isReturned, type_=Integer).label('numReturns'), func.count(Order.affiliate_user_id).label('numAffiliatePurchases')).filter(Order.affiliate_user_id==c.user.id).filter(Order.date >= c.lowerDate).filter(Order.date < c.upperDate).group_by(Order.product_id).group_by(Order.date).all()
            
            """SINGLE PRODUCT FOR AFFILIATE"""
            #c.orders = Session_.query(Order.product_id, func.datediff(Order.date, c.lowerDate), func.count('*').label('total'), func.sum(Order.isReturned, type_=Integer).label('numReturns'), func.count(Order.affiliate_user_id).label('numAffiliatePurchases')).filter(Order.affiliate_user_id==c.user.id).filter(Order.product_id==c.product.id).filter(Order.date >= c.lowerDate).filter(Order.date < c.upperDate).group_by(Order.product_id).group_by(Order.date).all()
            #c.impressions = Session_.query(Impression.product_id, func.datediff(Impression.date, c.lowerDate), func.count('*').label('total'), func.sum(case([(Impression.affiliate_ts != nullToken, 1)],else_=0)), func.sum(case([(Impression.order_ts != nullToken, 1)],else_=0)), func.sum(case([(and_(Impression.affiliate_ts != nullToken, Impression.order_ts != nullToken), 1)],else_=0)).label('buyConversions'), func.sum(case([(and_(Impression.purchase_ts != nullToken, Impression.order_ts != nullToken), 1)],else_=0)).label('purchaseConversions')).filter(c.user.id==Impression.affiliate_user_id).filter(Impression.product_id==c.product.id).filter(Impression.date >= c.lowerDate).filter(Impression.date < c.upperDate).group_by(Impression.product_id).group_by(Impression.date).all()
            
            
            
            """Each row is (product_id, date, total, affiliateViews, orderViews, buyConversions, purchaseConversions)"""
            c.impressions = Session_.query(Impression.product_id, func.datediff(Impression.date, c.lowerDate), func.count('*').label('total'), func.sum(case([(Impression.affiliate_ts != nullToken, 1)],else_=0)), func.sum(case([(Impression.order_ts != nullToken, 1)],else_=0)), func.sum(case([(and_(Impression.affiliate_ts != nullToken, Impression.order_ts != nullToken), 1)],else_=0)).label('buyConversions'), func.sum(case([(and_(Impression.purchase_ts != nullToken, Impression.order_ts != nullToken), 1)],else_=0)).label('purchaseConversions')).filter(c.user.id==Impression.affiliate_user_id).filter(Impression.date >= c.lowerDate).filter(Impression.date <= c.upperDate).group_by(Impression.product_id).group_by(Impression.date).all()
            logging.info(c.impressions)
            self.__Temp(c, True)
        return render('/account/accountSummary.mak')
    def reports(self):
        c.title = "Sales Dashboard"
        c.items = c.user.programs

        if len(c.items) > 0:
            nullToken = c.nullToken
            
            """Each row is (program_id, date, numPurchases, numAffiliatePurchases, affiliateTotal, purchaseTotal """
            #JOIN was unnecessary
            #c.orders = Session_.query(Order.product_id, func.datediff(Order.date, c.lowerDate), func.count('*').label('total'), func.sum(Order.isReturned, type_=Integer).label('numReturns'), func.count(Order.affiliate_user_id).label('numAffiliatePurchases')).join((Product, and_(Order.seller_user_id==c.user.id, Order.product_id==Product.id))).filter(Order.date >= c.lowerDate).filter(Order.date < c.upperDate).group_by(Order.product_id).group_by(Order.date).all()
            c.orders = Session_.query(Order.program_id,
                                      func.datediff(Order.date, c.lowerDate),
                                      func.count('*').label('numPurchases'), 
                                      func.count(Order.affiliate_user_id).label('numAffiliatePurchases'),
                                      func.sum(case([(Order.affiliate_user_id != None, Order.amount)], else_=0)).label('affiliateTotal'),
                                      func.sum(Order.amount).label('purchaseTotal'),
                                      ).filter(Order.merchant_user_id==c.user.id).filter(Order.date >= c.lowerDate).filter(Order.date <= c.upperDate).group_by(Order.program_id).group_by(Order.date).all()
            #c.days = Session_.query(func.datediff(Transaction.date, c.lowerDate), func.sum(Transaction.amount)).filter(Transaction.user_id==c.user.id).filter(Transaction.date >= c.lowerDate).filter(Transaction.date < c.upperDate).group_by(Transaction.date).all()
 
            """SINGLE PRODUCT FOR OWNER"""
            #c.orders = Session_.query(Order.product_id, func.datediff(Order.date, c.lowerDate), func.count('*').label('total'), func.sum(Order.isReturned, type_=Integer).label('numReturns'), func.count(Order.affiliate_user_id).label('numAffiliatePurchases')).filter(Order.product_id==c.product.id).filter(Order.date >= c.lowerDate).filter(Order.date < c.upperDate).group_by(Order.product_id).group_by(Order.date).all()
            #c.impressions = Session_.query(Impression.product_id, func.datediff(Impression.date, c.lowerDate), func.count('*').label('total'), func.sum(case([(Impression.affiliate_ts != nullToken, 1)],else_=0)), func.sum(case([(Impression.order_ts != nullToken, 1)],else_=0)), func.sum(case([(and_(Impression.affiliate_ts != nullToken, Impression.order_ts != nullToken), 1)],else_=0)).label('buyConversions'), func.sum(case([(and_(Impression.purchase_ts != nullToken, Impression.order_ts != nullToken), 1)],else_=0)).label('purchaseConversions')).filter(Impression.product_id==c.product.id).filter(Impression.date >= c.lowerDate).filter(Impression.date < c.upperDate).group_by(Impression.product_id).group_by(Impression.date).all()
            
            
            """Each row is (product_id, date, affiliateViews, conversionTime)"""
            c.impressions = Session_.query(Impression.program_id, 
                                           func.datediff(Impression.date, c.lowerDate), 
                                           func.sum(case([(Impression.affiliate_ts != nullToken, 1)],else_=0)), 
                                           func.avg(case([(and_(Impression.purchase_ts != nullToken, Impression.affiliate_ts != nullToken), func.time_to_sec(func.timediff(Impression.purchase_ts,Impression.affiliate_ts)))],else_=0), 
        
                                    ).label('purchaseConversions')).join((Program, and_(c.user.id==Program.merchant_user_id, Impression.program_id==Program.id))).filter(Impression.date >= c.lowerDate).filter(Impression.date <= c.upperDate).group_by(Impression.program_id).group_by(Impression.date).all()
            logging.info(c.impressions)
            self.__Temp(c)
        return render('/account/accountSummary.mak')
