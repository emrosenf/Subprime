from elixir import *
from subprime.model import Session, metadata
from sqlalchemy import func, and_, Index, UniqueConstraint
from sqlalchemy.sql import text
from sqlalchemy.databases.mysql import MSEnum, MSText, MSLongText
from sqlalchemy.ext.associationproxy import AssociationProxy
import logging 
from decimal import Decimal
from datetime import datetime, timedelta
from cStringIO import StringIO
options_defaults.update({
                         'inheritance': 'multi',
                         'shortnames': True,
                         'table_options' : { 'mysql_engine' : 'InnoDB' }
                        })   
log = logging.getLogger("user")
class NotAuthenticated(Exception):
    pass

class Institution(Entity):
    id = Field(Unicode(255), primary_key=True)
    respondent_name = Field(Unicode(255))
    parent_name = Field(Unicode(255))
    count = Field(Integer)
    
class Lar(Entity):
        year = Field(MSEnum('2007', '2008', '2009'))
        respondent = ManyToOne('Institution')
        agency_code = Field(Integer)
        loan_type = Field(Integer)
        property_type = Field(Integer)
        loan_purpose = Field(Integer)
        loan_amount = Field(Integer)
        preapproval = Field(Integer)
        action_taken = Field(Integer)
        tract = Field(Unicode(255))
        state = Field(Unicode(255))
        county = Field(Unicode(255))
        ethnicity = Field(Integer)
        race = Field(Integer)
        sex = Field(Integer)
        income = Field(Integer)
        purchaser = Field(Integer)
        denial = Field(Integer)
        rate_spread = Field(Numeric)

#
#class User(MyEntity):
#    
#    email = Field(Unicode(255), unique=True)
#    password = Field(Unicode(255), required=True)
#    created = Field(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
#    lastLogin = Field(TIMESTAMP)
#    active = Field(Boolean, server_default=text("FALSE"))
#    firstName = Field(Unicode(255))
#    lastName = Field(Unicode(255))
#    accountBalance = Field(Numeric, server_default=text("0"))
#    referrer = ManyToOne('User')
#    
#    def __repr__(self):
#        return '<%r, email: %r, created: %s, active: %s>' \
#               % (self.__class__.__name__.capitalize(), 
#                  self.email, self.created.ctime(), self.active)
# 
#    def adjustBalance(self, amount, commit=False):
#        self.accountBalance += amount
#        if commit:
#            Session.commit()
#
#    @classmethod
#    def adjustUserBalance(cls, user, amount, commit=False):
#        user.adjustBalance(amount, commit)
#
#    
#    @classmethod
#    def authenticate(cls, username, password):
#        try:
#            user=cls.query.filter_by(email=username, active=True).one()
#            if user and utilities.encrypt(password) == user.password:
#                return user
#        except Exception:
#            raise NotAuthenticated
#        raise NotAuthenticated
#    
#    def validate_password(user, password):
#        return utilities.encrypt(password) == user.password
#        
#    @classmethod
#    def bank(cls):
#        return User.get_by(email="bank") 
#    
#    def transactions(self, lowerDate=None, upperDate=None):
#        query = Transaction.query.filter_by(user = self).order_by(Transaction.date)
#        if lowerDate:
#            query = query.filter(Transaction.date >= lowerDate)
#        if upperDate:
#            query = query.filter(upperDate >= Transaction.date)
#        return query.all()
#    
#    def orders(self, lowerDate=None, upperDate=None):
#        query = Order.query.filter_by(seller = self).order_by(Order.date)
#        if lowerDate:
#            query = query.filter(Order.date >= lowerDate)
#        if upperDate:
#            query = query.filter(upperDate >= Order.date)
#        return query.all()
#
#class Merchant(User):
#    name = Field(Unicode(255), unique=True)
#    programs = OneToMany('Program', inverse='merchant')
#    
#    @property
#    def affiliatesAwaiting(self):
#        return Session.query(Affiliate, ProgramApplication.program_id, ProgramApplication.url)\
#                    .join(ProgramApplication).filter(ProgramApplication.merchant==self).all()
#                    
#class Affiliate(User):
#    url = Field(Unicode(255))
#    paySetUp = Field(Boolean, server_default=text("FALSE"))
#    automaticPay = Field(Boolean, server_default=text("FALSE"))
#    paymentMinimum = Field(Numeric, server_default=text("50"))
#    paymentsIssued = Field(Numeric, server_default=text("0"))
#    numReturns = Field(Integer, server_default=text("0"))
#    numSales = Field(Integer, server_default=text("0"))
#    totalSales = Field(Numeric, server_default=text("0"))
#    program_assoc = OneToMany('ProgramAffiliate')
#    programs = AssociationProxy('program_assoc', 'program',
#                                creator=lambda program: ProgramAffiliate(program=program))
#    #programs = ManyToMany('Program', tablename='programaffiliate')
#    
#class ProgramAffiliate(MyEntity):
#    program = ManyToOne('Program', primary_key=True)
#    affiliate = ManyToOne('Affiliate', primary_key=True)
#    numSales = Field(Integer, server_default=text("0"))
#    date = Field(TIMESTAMP, server_default=text("NOW()"))
#    
#class ProgramBlock(MyEntity):
#    program = ManyToOne('Program', primary_key=True)
#    affiliate = ManyToOne('Affiliate', primary_key=True)
#
#class Order(MyEntity):
#    date = Field(DATE)
#    time = Field(TIME)
#    tracking = Field(Unicode(255))
#    amount = Field(Numeric, server_default=text("0"))
#    buyer = ManyToOne('Buyer', required=True)
#    program = ManyToOne('Program', required=True, inverse='orders', column_kwargs=dict(index=False))
#    merchant = ManyToOne('Merchant')
#    affiliate = ManyToOne('Affiliate')
#    transactions = OneToMany('OrderTransaction')
#    isReturned = Field(Boolean, server_default=text("FALSE"))
#    isCompleted = Field(Boolean, server_default=text("FALSE"))
#    
#    @classmethod
#    def new(cls, program, buyer, amount, tracking=None, affiliate=None, date=datetime.today().date(), time=datetime.today().time()):
#        order = cls(program=program, merchant=program.merchant, tracking=tracking, amount=amount, buyer=buyer, affiliate=affiliate, date=date, time=time)
#        program.numSales += 1
#        program.totalSales += amount
#        affiliate.numSales += 1
#        affiliate.totalSales += amount
#        pa = ProgramAffiliate.query.filter_by(program=program).filter_by(affiliate=affiliate).one()
#        pa.numSales += 1
#        commission = program.getCommission(amount)
#        fee = utilities.round(Decimal('0.2')*commission)
#        transactionAffiliate = OrderTransaction.new(affiliate, order, 'affiliate', commission, date, time, commit=False)
#        transactionBank = OrderTransaction.new(user=User.bank(), order=order, type='saleFee', amount=fee, date=date, time=time, commit=False)
#        transactionMerchant = OrderTransaction.new(user=program.merchant, order=order, type='sale', amount=-(commission),date=date,time=time, commit=False)
#        transactionMerchantFee = OrderTransaction.new(user=program.merchant, order=order, type='saleFee', amount=-(fee),date=date,time=time, commit=False)
#        #Session.commit()
#        #TODO This is temporary
##        payment = OrderTransaction.new(user=buyer, type='ccDebit', amount=product.price, order=order, date=date)
##        
##        order.product.buyers.append(buyer)
##        product.numBuys += 1
##        transactionFee = utilities.round(Decimal('0.075')*product.price + 1)
##        transactionBank = OrderTransaction.new(user=User.bank(), order=order, type='saleFee', amount=transactionFee, date=date)
##        balance = product.price - transactionFee
##        affiliateFee = 0
##        if affiliate:
##            affiliateFee = utilities.round(balance*product.affiliateFee)
##            transactionAffiliate = OrderTransaction.new(user=affiliate, order=order, type='affiliate', amount=affiliateFee, date=date)
##        transactionSeller = OrderTransaction.new(user=product.seller, order=order, type='sale', amount=(balance-affiliateFee), date=date)
##        transactionBuyer = OrderTransaction.new(user=buyer, order=order, type='buy', amount=-product.price, date=date)
#        Session.commit()
#        return order
#        
#    def __repr__(self):
#        return '<%r, buyer: %r, product: %s, affiliate: %s>' \
#               % (self.__class__.__name__.capitalize(), 
#                  self.buyer_id, self.product.name, self.affiliate.email if self.affiliate else "none")
#
#class Return(MyEntity):
#    date = Field(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
#    order = ManyToOne('Order', required=True)
#    transactions = OneToMany('ReturnTransaction')
#    
#    @classmethod
#    def new(cls, order, date=None):
#        if not date:
#            date = datetime.today()
#        Ret = cls(order=order, date=date)
#        order.isReturned = True
#        order.product.numReturns += 1
#        order.product.seller.numReturns += 1
#        order.product.buyers.remove(order.buyer)
#        order.buyer .itemsReturned.append(order.product)
#        transactions = order.transactions
#        logging.info('Num of transactions: %s' % len(transactions))
#        types = {'sale': 'saleReturn', 'affiliate': 'affiliateReturn', 'buy': 'buyReturn', 'ccDebit' : 'ccCredit', 'saleFee' : 'saleFeeReturn'}
#        returns = []
#        for transaction in transactions:
#            logging.info('Type: %s, Amount: %s' % (transaction.type, transaction.amount))
#            if transaction.type in ['buy', 'ccDebit']:
#                returns.append(ReturnTransaction.new(user=transaction.user, _return=Ret,
#                            type=types[transaction.type], amount=-transaction.amount, date=date))
#            elif transaction.type == 'saleFee':
#                returns.append(ReturnTransaction.new(user=transaction.user, _return=Ret,
#                            type=types[transaction.type], amount=-transaction.amount, date=(date - timedelta(days=7))))
#            else:              
#                transaction.user.backdateDebit(_return = Ret, type=types[transaction.type],
#                            amount = transaction.amount, date = (date - timedelta(days=7)))
#        Session.commit()   
#        return Ret 
#'''Represents the following types of transactions:
#   withhold, withholdRelease, returnDeficitCredit, returnDeficitReconcile  
#'''
#class Transaction(MyEntity):
#    user = ManyToOne('User', required=True)
#    type = Field(MSEnum('sale', #Credits seller when item is sold
#                        'saleReturn', #Debit for the return
#                        'affiliate', #Credits affiliate when item is sold
#                        'affiliateReturn', #Debit for the return
#                        'buy', #Debit buyer when item is bought
#                        'buyReturn', #Credit buyer when item is returned
#                        'ccDebit', #Credit buyer account when money is debited from their credit card
#                        'ccCredit', #Debit buyer account when money is credited to their CC (in a return)
#                        'saleFee', #Credits bank for transaction fees when item is sold
#                        'saleFeeReturn', #Debits bank for transaction fees when item is returned 
#                        'payCheck', #Debits seller account for amount of paycheck
#                        'withhold', #Debits seller account during pay period for withholding
#                        'withholdRelease', #Credits seller account during pay period for released withholding
#                        'withholdDebit', #Debits WITHHOLD only during a return
#                        'returnDeficitDebit', #Debits bank when a seller has insufficient funds for a return
#                        'returnDeficitCredit', #Credits bank when seller pays bank back 
#                        'returnDeficitReconcile', #Debits seller to pay back bank
#                        'returnPayPeriodDebit', #Debits Pay Period during return
#                        'returnAcctBalanceDebit', #Debits Accct Balance during return
#                        'referralCredit', #Credits seller for a referred user's sales
#                        ))
#    amount = Field(Numeric)
#    date = Field(DATE)
#    time = Field(TIME)
#    payPeriod = ManyToOne('Transaction')
#
#    def __repr__(self):
#        return '<%r, user: %r, type: %r, amount: %s>' \
#               % (self.__class__.__name__.capitalize(), 
#                  self.user.email, self.type, self.amount)
#    @property
#    def description(self):
#        return self.type
#
#    @classmethod
#    def new(cls, user, type, amount, date=None, payPeriod=None):
#        transaction = cls(user=user, type=type, amount=amount, date=date, payPeriod=payPeriod)
#        User.adjustUserBalance(user, amount)
#        Session.commit()
#        return transaction
#    
#    @classmethod
#    def typesReferral(cls):
#        return ['sale', 'saleReturn', 'returnAcctBalanceDebit']
#
#    @classmethod
#    def typesCredit(cls):
#        return ['sale', 'affiliate', 'buyReturn', 'ccDebit', 'saleFee', 'withholdRelease', 'returnDeficitCredit', 'referralCredit']
#    
#    @classmethod
#    def typesDebit(cls):
#        return ['saleReturn', 'affiliateReturn', 'buy', 'ccCredit', 'saleFeeReturn',
#                 'payCheck', 'withhold', 'returnDeficitDebit', 'returnDeficitReconcile', 'returnAcctBalanceDebit']
#    
#    @property
#    def details(self):
#        return utilities.render_def("/account/transactionDetails.mak", self.__class__.__name__, t=self)
#
#'''Represents the following types of transactions:
#   sale, affiliate, buy, saleFee, ccDebit
#'''
#
#class OrderTransaction(Transaction):
#    order = ManyToOne('Order', required=True)
#
#    @classmethod
#    def new(cls, user, order, type, amount, date=datetime.today().date(), time=datetime.today().time(), commit=True):
#        transaction = cls(user=user, order=order, type=type, amount=amount, date=date, time=time)
#        user.adjustBalance(amount)
#        if commit:
#            Session.commit()
#        return transaction
#    
#    
#    @property
#    def description(self):
#        return self.type + " of " + self.order.product.name
#
#'''Represents the following types of transactions:
#   saleReturn, affiliateReturn, buyReturn, saleFeeReturn, ccCredit, returnDeficitDebit,
#   returnPayPeriodDebit, returnAcctBalanceDebit
#'''
#class ReturnTransaction(Transaction):
#    _return = ManyToOne('Return', required=True)
#    
#    @classmethod
#    def new(cls, user, _return, type, amount, date=None, payPeriod=None, adjustBalance=True):
#        transaction = cls(user=user, _return=_return, type=type, amount=amount, date=date, payPeriod=payPeriod)
#        if adjustBalance: #Handles case where return is taken from payperiod, no need to adjust balance
#            User.adjustUserBalance(user, amount)
#        Session.commit()
#        return transaction
#    
#    @property
#    def description(self):
#        return self.type + " of " + self._return.order.product.name
#
#'''Represents the following types of transactions:
#   payCheck  
#'''
#class PayPeriod(Transaction):
#    method = Field(MSEnum('check', 'paypal', 'directDeposit'))
#    completed = Field(Boolean, server_default=text("FALSE"))
#    
#    @property
#    def transactions(self):
#        return Transaction.query.filter_by(payPeriod=self).order_by(Transaction.date).all()
#    
#    @property
#    def description(self):
#        return "Paycheck"
#    
#'''Represents the following types of transactions:
#   referralCredit 
#'''
#class ReferralTransaction(Transaction):
#    referral = ManyToOne('User')
#    referralPayPeriod = ManyToOne('PayPeriod')
#    
#    def describe(self):
#        return "Referral bonus for " + referral.email
#
#
#
#class Impression(MyEntity):
#    program = ManyToOne('Program')
#    affiliate = ManyToOne('Affiliate')
#    ip = Field(Unicode(255))
#    date = Field(DATE)
#    affiliate_ts = Field(TIMESTAMP, server_default=text("'0000-00-00 00:00:00'"))
#    purchase_ts = Field(TIMESTAMP, server_default=text("'0000-00-00 00:00:00'"))
#    #date = Field(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
#    #page = Field(MSEnum('affiliate', 'order'), server_default=text("'affiliate'"))
#
#
#    @classmethod
#    def update(cls, id, type):
#        imp = cls.get_by(id=id)
#        if not imp:
#            return False
#        else:
#            if type == 'order':
#                imp.order_ts = datetime.today()
#            elif type== 'purchase':
#                imp.purchase_ts = datetime.today()
#            Session.commit()
#            return True
#                     
#
#class Category(MyEntity):
#    name = Field(Unicode(255))
#    numProducts = Field(Integer, server_default=("0"))
#    parent = ManyToOne('Category')
#
#
#class Program(MyEntity):
#    name = Field(Unicode(255))
#    merchant = ManyToOne('Merchant', inverse='program')
#    type = Field(MSEnum('sale', 'lead'), server_default=text("'sale'"))
#    isPercentage = Field(Boolean, server_default=text("FALSE"))
#    isRecurring = Field(Boolean, server_default=text("FALSE"))
#    autoApprove = Field(Boolean, server_default=text("FALSE"))
#    fee = Field(Numeric, server_default=text('0'))
#    url = Field(Unicode(255))
#    currency = Field(Unicode(255), server_default=text("'USD'"))
#    cookieLength = Field(Integer, server_default=text("30"))
#    date = Field(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
#    #affiliate_assoc = OneToMany('ProgramAffiliate')
#    #affiliates = AssociationProxy('affiliate_assoc', 'affiliate',
#    #                            creator=_create)
#    #affiliates = ManyToMany('Affiliate', inverse='programs', tablename='programaffiliate')  
#    orders = OneToMany('Order', inverse='program')
#    numSales = Field(Integer, server_default=text("0"))
#    totalSales = Field(Numeric, server_default=text("0"))
#    numBuys = Field(Integer, server_default=text("0"))
#    numReturns = Field(Integer, server_default=text("0"))
#    numAffiliates = Field(Integer, server_default=text("0"))
#    numAffiliateImpresions = Field(Integer, server_default=text("0"))
#    numPurchasePageImpressions = Field(Integer, server_default=text("0"))
#    categories = ManyToMany('Category', tablename='product_category')
#    
#    def getCommission(self, amount):
#        if self.isPercentage:
#            return utilities.round((self.fee/100)*Decimal(amount))
#        else:
#            return self.fee
#
#    @property
#    def affiliatesAwaiting(self):
#        return Affiliate.query.join(ProgramAffiliate)\
#                .filter(ProgramAffiliate.program_id==self.id)\
#                .filter(ProgramAffiliate.approved==False)\
#                .filter(ProgramAffiliate.banned==False).all()
#
#    @property
#    def affiliates(self):
#        return Affiliate.query.join(ProgramAffiliate)\
#                .filter(ProgramAffiliate.program_id==self.id).all()
#                
#    @classmethod
#    def addAffiliate(cls, program_id, affiliate_id):
#        ''' Delete the application '''
#        ProgramApplication.query.filter(ProgramApplication.program_id==program_id)\
#                        .filter(ProgramApplication.affiliate_user_id==affiliate_id).delete()
#        return ProgramAffiliate.new(program_id=program_id, affiliate_user_id=affiliate_id)
#        
#    @classmethod
#    def blockAffiliate(cls, program_id, affiliate_id):
#        ''' Delete the application '''
#        ProgramApplication.query.filter(ProgramApplication.program_id==program_id)\
#                        .filter(ProgramApplication.affiliate_user_id==affiliate_id).delete()
#        ''' Delete Enrolled Affiliate '''    
#        ProgramAffiliate.query.filter(ProgramAffiliate.program_id==program_id)\
#                        .filter(ProgramAffiliate.affiliate_user_id==affiliate_id).delete()
#        return ProgramBlock.new(program_id=program_id, affiliate_user_id=affiliate_id)
#                
#                
#    @classmethod
#    def new(cls, **kwargs):
#        p = cls(**kwargs)
#        if kwargs.get('category_id'):
#            Category.table.update(Category.id == kwargs['category_id'],
#                    values={Category.table.c.numProducts:Category.table.c.numProducts+1}).execute()
#        Session.commit()
#        return p       
#
#class ProgramApplication(MyEntity):
#    merchant = ManyToOne('Merchant')
#    program = ManyToOne('Program')
#    affiliate = ManyToOne('Affiliate')
#    url = Field(Unicode(255))
#    
#class ProgramPage(MyEntity):
#    program = ManyToOne('Program', primary_key=True)
#    text = Field(BLOB)
#    
#    
#class WikiDownload(MyEntity):
#    name = Field(Unicode(255))
#    date = Field(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
#    ip = Field(Unicode(255))
#    
#
##class Product(MyEntity):
##    name = Field(Unicode(255))
##    description = Field(Unicode(255))
##    #files = OneToMany('File', inverse='product')
##    fileName = Field(Unicode(255))
##    fileHandle = Field(Unicode(255))
##    file_ts = Field(TIMESTAMP, server_default=text("'0000-00-00 00:00:00'"))
##    imageHandle = Field(Unicode(255))
##    url = Field(Unicode(255))
##    price = Field(Numeric)
##    currency = Field(Unicode(255), server_default=text("'USD'"))
##    affiliateFee = Field(Numeric)
##    #seller = ManyToOne('Merchant', required=True, inverse='itemsSell')
##    date = Field(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
##    
##    category = ManyToOne('Category')
##
##    #buyers = ManyToMany('User', inverse='itemsBuy', tablename='productbuyer')
##    orders = OneToMany('Order', inverse='product')
##    numBuys = Field(Integer, server_default=text("0"))
##    numReturns = Field(Integer, server_default=text("0"))
##    numAffiliates = Field(Integer, server_default=text("0"))
##    numAffiliateImpresions = Field(Integer, server_default=text("0"))
##    numPurchasePageImpressions = Field(Integer, server_default=text("0"))
##    allowDownload = Field(Boolean, server_default=text("FALSE"))
##    #categories = ManyToMany('Category', tablename='product_category')
##
##    @property
##    def fee(self):
##        return utilities.round(Decimal('0.075')*self.price + 1)
##    
##    @property
##    def afterFeeAmount(self):
##        return self.price - self.fee
##
##    @property
##    def affiliateAmount(self):
##        return utilities.round(self.afterFeeAmount*self.affiliateFee)
##
##    def __repr__(self):
##        return '<%r, name: %r, price: %s, seller: %s>' \
##               % (self.__class__.__name__.capitalize(), 
##                  self.name, self.price, self.seller_user_id)
##               
##    @classmethod
##    def new(cls, **kwargs):
##        p = cls(**kwargs)
##        if kwargs['category_id']:
##            Category.table.update(Category.id == kwargs['category_id'],
##                    values={Category.table.c.numProducts:Category.table.c.numProducts+1}).execute()
##        Session.commit()
##        return p
##    
##    def edit(self, d):
##        self.from_dict(d)
##        Session.commit()
##               
##    def saleSummary(self, by_date=True, lowerDate=None, upperDate=None, affiliate=False, nonAffiliate=False):
##        query = Session.query(func.count(Order.product_id).label('count')) \
##                            .filter(Order.product==self)
##        if lowerDate:
##            if by_date:
##                query = Session.query(func.count(Order.product_id).label('count'), func.datediff(Order.date, lowerDate).label('day')) \
##                            .filter(Order.product==self) \
##                            .group_by('day')
##            query = query.filter(Order.date > lowerDate)
##        if upperDate:
##            query = query.filter(Order.date < upperDate)
##        if affiliate:
##            query = query.filter(Order.affiliate_user_id != None)
##        if nonAffiliate:
##            query = query.filter(Order.affiliate_user_id == None)
##        return query.all()
#               
    
