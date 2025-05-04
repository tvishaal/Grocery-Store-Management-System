from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime


db= SQLAlchemy()


class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class User(db.Model, UserMixin):
    id= db.Column(db.Integer(), primary_key=True,autoincrement=True)
    name=db.Column(db.String(),)
    username=db.Column(db.String())
    email=db.Column(db.String())
    phone=db.Column(db.Integer())
    password=db.Column(db.String(),nullable=False)
    address=db.Column(db.String())
    lastlogin = db.Column(db.DateTime(), default=datetime.utcnow)
    carts = db.relationship('Carts', backref='user')
    active = db.Column(db.Boolean(), default = False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users',
                         backref=db.backref('users', lazy='dynamic'))
    section = db.relationship('Section', backref='creator')
    
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))



class Section(db.Model):
    S_id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    S_name = db.Column(db.String, nullable=False)
    products = db.relationship("Product", backref = "Section")
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_approved = db.Column(db.Boolean(), default=False)


class Product(db.Model):
    P_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    P_name = db.Column(db.String, nullable=False)
    P_section = db.Column(db.Integer, db.ForeignKey("section.S_id") )
    #section = db.relationship('Section',back_populates='products')
    price = db.Column(db.Integer, nullable=False)
    units = db.Column(db.Integer, nullable=False)
    unit_type = db.Column(db.String)

class Carts(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    items = db.relationship('Cart_items', backref='cart')

class Cart_items(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    item_productId = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer)

