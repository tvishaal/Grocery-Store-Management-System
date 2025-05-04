from flask_restful import Api, Resource, reqparse
from models import *
from flask_restful import fields, marshal_with
from flask_security import  login_required, auth_required, roles_required
from flask import jsonify
from instance import cache
api = Api()
parser = reqparse.RequestParser()




# Role Parser==========================================================================================
role_parser = reqparse.RequestParser()
role_parser.add_argument('name', type=str)
role_parser.add_argument('description', type=str)





# Cart Parser====================================================================================================
cart_parser = reqparse.RequestParser()
cart_parser.add_argument('user_id', type=int)





#============================================================================================================

#======================================================== UserResource ========================================================================================
user_parser = reqparse.RequestParser()
user_parser.add_argument('name', type=str)
user_parser.add_argument('username', type=str)
user_parser.add_argument('email', type=str)
user_parser.add_argument('phone', type=int)
user_parser.add_argument('password', type=str)
user_parser.add_argument('address', type=str)
user_parser.add_argument('active', type=bool) 

user_fields = {
    'id': fields.Integer(attribute='U_id'),
    'name': fields.String(attribute='U_name'),
    'email': fields.String,
    'phone': fields.Integer,
    'password': fields.String,  # Note: Storing passwords securely is crucial. This is just for illustration.
    'is_active': fields.Boolean,
}

class UserResource(Resource):
    @cache.cached(timeout=1)
    @auth_required("token")
    @roles_required("admin")
    def get(self, ):
        
        user = User.query.all()
        if user:
            return marshal_with(user, user_fields)
        else:
            return {'message': 'User not found'}, 404
   
    def post(self):
        args = user_parser.parse_args()
        new_user = User(**args)
        db.session.add(new_user)
        db.session.commit()
        return {'message': 'User created successfully!', 'user_id': new_user.id}, 201
        
    @auth_required("token")
    def put(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        args = user_parser.parse_args()

        
        # Manually update each attribute
        user.name = args['name']
        user.username = args['username']
        user.phone = args['phone']
        user.password = args['password']
        user.address = args['address']

        db.session.commit()
        return {'message': 'User updated successfully!'}, 200
    

    @auth_required("token")
    @roles_required("admin")
    def delete(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        sections = Section.query.filter_by(creator_id=user.id).all()
        for section in sections:
            products = Product.query.filter_by(P_section=section.S_id).all()
            for product in products:
                db.session.delete(product)

            db.session.delete(section)

        roles_users = RolesUsers.query.filter_by(user_id=user.id).all()
        for ru in roles_users:
            db.session.delete(ru)

        db.session.delete(user)
        db.session.commit()

        return {'message': 'User, sections, and associated products deleted successfully!'}, 200

# Add the UserResource to the API
api.add_resource(UserResource, '/api/users/<int:user_id>','/api/users')
#==============================================================================================================================


#=================================================== RolesUsersResource=================================================================================================
roles_users_parser = reqparse.RequestParser()
roles_users_parser.add_argument('user_id', type=int)
roles_users_parser.add_argument('role_id', type=int) 

class RolesUsersResource(Resource):
    @cache.cached(timeout=1)
    def get(self, roles_users_id):
        roles_users = RolesUsers.query.get(roles_users_id)
        if roles_users:
            return {
                'id': roles_users.id,
                'user_id': roles_users.user_id,
                'role_id': roles_users.role_id
            }, 200
        else:
            return {'message': 'RolesUsers entry not found'}, 404

    def post(self):
        args = roles_users_parser.parse_args()

        # Check if the user and role exist
        user = User.query.get(args['user_id'])
        role = Role.query.get(args['role_id'])

        if not user or not role:
            return {'message': 'User or Role not found'}, 404

        # Create a new entry in the roles_users table
        new_roles_users = RolesUsers(user_id=args['user_id'], role_id=args['role_id'])
        db.session.add(new_roles_users)
        db.session.commit()

        return {'message': 'RolesUsers entry created successfully!', 'id': new_roles_users.id}, 201

    def put(self, roles_users_id):
        roles_users = RolesUsers.query.get(roles_users_id)
        if not roles_users:
            return {'message': 'RolesUsers entry not found'}, 404

        args = roles_users_parser.parse_args()
        roles_users.user_id = args['user_id']
        roles_users.role_id = args['role_id']

        db.session.commit()
        return {'message': 'RolesUsers entry updated successfully!'}, 200

    def delete(self, roles_users_id):
        roles_users = RolesUsers.query.get(roles_users_id)
        if not roles_users:
            return {'message': 'RolesUsers entry not found'}, 404

        db.session.delete(roles_users)
        db.session.commit()
        return {'message': 'RolesUsers entry deleted successfully!'}, 200

# Add the RolesUsersResource to the API
api.add_resource(RolesUsersResource, '/api/roles_users/<int:roles_users_id>')   


#==================================================================SectionResource==============================================================================
section_parser = reqparse.RequestParser()
section_parser.add_argument('name', type=str)
section_parser.add_argument('creator_id', type=int)
section_parser.add_argument('is_approved', type=bool)

# Define the fields for the Section resource
section_fields = {
    'id': fields.Integer(attribute='S_id'),
    'name': fields.String(attribute='S_name'),
    'creator_id': fields.Integer,
    'is_approved': fields.Boolean,
}

class SectionResource(Resource):
    @cache.cached(timeout=1)
    @marshal_with(section_fields)
    @auth_required("token")
    @roles_required("admin","manager")
    def get(self, section_id=None):
        if section_id:
            section = Section.query.get(section_id)
            if section:
                return section, 200
            else:
                return {'message': 'Section not found'}, 404
        else:
            sections = Section.query.all()
            return sections, 200
    @auth_required("token")
    @roles_required("admin","manager")
    def post(self):
        data = section_parser.parse_args()
        new_section = Section(
            S_name=data['name'],
            creator_id=data['creator_id'],
            is_approved=data['is_approved']
        )

        db.session.add(new_section)
        db.session.commit()

        return {'message': 'Section created successfully!', 'section_id': new_section.S_id}, 201
    
    
    @auth_required("token")
    @roles_required("admin","manager")
    def put(self, section_id):
        section = Section.query.get(section_id)
        if not section:
            return {'message': 'Section not found'}, 404

        data = section_parser.parse_args()

        section.S_name = data['name']
        section.creator_id = data['creator_id']
        section.is_approved = data['is_approved']

        db.session.commit()

        return {'message': 'Section updated successfully!'}, 200

    @auth_required("token")
    def delete(self, section_id):
        
        section = Section.query.get(section_id)
        if not section:
            return {'message': 'Section not found'}, 404

        db.session.delete(section)

        # You need to call .all() to execute the query and get the list of products
        products = Product.query.filter_by(P_section=section_id).all()
        for product in products:
            db.session.delete(product)

        db.session.commit()
        return {'message': 'Section deleted successfully!'}, 200

api.add_resource(SectionResource, '/api/sections', '/api/sections/<int:section_id>')
#================================================================================================================================================

#===================================================== Product =======================================================================================
product_parser = reqparse.RequestParser()
product_parser.add_argument('name', type=str, required=True, help='Name of the product')
product_parser.add_argument('section_id', type=int, required=True, help='ID of the section to which the product belongs')
product_parser.add_argument('price', type=int, required=True, help='Price of the product')
product_parser.add_argument('units', type=int, required=True, help='Number of units of the product')
product_parser.add_argument('unit_type', type=str, required=True, help='Type of the product unit')

# Define the marshal fields for Product
product_fields = {
    'id': fields.Integer(attribute='P_id'),
    'name': fields.String(attribute='P_name'),
    'section_id': fields.Integer(attribute='P_section'),
    'price': fields.Integer,
    'units': fields.Integer,
    'unit_type': fields.String
}

class ProductResource(Resource):
    @cache.cached(timeout=1)
    @marshal_with(product_fields)
       
    @auth_required("token")
    def get(self, product_id=None):
        if product_id:
            product = Product.query.get(product_id)
            if product:
                return product, 200
            else:
                return {'message': 'Product not found'}, 404
        else:
            products = Product.query.all()
            return products, 200
    @auth_required("token")
    @roles_required("manager")
    def post(self):
        data = product_parser.parse_args()
        existing_product = Product.query.filter_by(P_name=data['name']).first()
        if existing_product:
            message = f"A product with the name '{data['name']}' already exists."
            return jsonify({'message': "Product already exists"}, 400)

        new_product = Product(
            P_name=data['name'],
            P_section=data['section_id'],
            price=data['price'],
            units=data['units'],
            unit_type=data['unit_type']
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Product created successfully!'})
        
    @auth_required("token")
    @roles_required("manager")
    def put(self, product_id):
        product = Product.query.get(product_id)
        if not product:
            return {'message': 'Product not found'}, 404
        data = product_parser.parse_args()
        product.P_name = data['name']
        product.P_section = data['section_id']
        product.price = data['price']
        product.units = data['units']
        product.unit_type = data['unit_type']
        db.session.commit()
        return {'message': 'Product updated successfully!'}, 200
    

    @auth_required("token")
    @roles_required("manager")
    def delete(self, product_id):
        product = Product.query.get(product_id)
        if not product:
            return {'message': 'Product not found'}, 404
        db.session.delete(product)
        db.session.commit()
        return {'message': 'Product deleted successfully!'}, 200

api.add_resource(ProductResource, '/api/products', '/api/products/<int:product_id>')


#=============================================================================================================================================

# Cart Parser====================================================================================================
cart_parser = reqparse.RequestParser()
cart_parser.add_argument('user_id', type=int)

class CartResource(Resource):
    @auth_required("token")
    @roles_required("customer")
    @cache.cached(timeout=1)
    def get(self, cart_id):
        cart = Carts.query.get(cart_id)
        if cart:
            return {
                'id': cart.id,
                'user_id': cart.user_id,
                'items': [item.name for item in cart.items]
            }, 200
        else:
            return {'message': 'Cart not found'}, 404
    @auth_required("token")
    @roles_required("customer")
    def post(self):
        args = cart_parser.parse_args()
        new_cart = Carts(user_id=args['user_id'])
        db.session.add(new_cart)
        db.session.commit()
        return {'message': 'Cart created successfully!', 'cart_id': new_cart.id}, 201

    def put(self, cart_id):
        cart = Carts.query.get(cart_id)
        if not cart:
            return {'message': 'Cart not found'}, 404

        args = cart_parser.parse_args()

        # Update user_id
        cart.user_id = args['user_id']

        # Update items if provided in the request
        if 'items' in args:
            items_data = args['items']
            # Assuming each item in items_data is a dictionary with keys: name, item_productId, price, quantity
            for item_data in items_data:
                # Check if the item exists in the cart, update it, or create a new one
                existing_item = next((item for item in cart.items if item.name == item_data['name']), None)
                if existing_item:
                    existing_item.item_productId = item_data['item_productId']
                    existing_item.price = item_data['price']
                    existing_item.quantity = item_data['quantity']
                else:
                    new_item = Cart_items(name=item_data['name'], item_productId=item_data['item_productId'],
                                        price=item_data['price'], quantity=item_data['quantity'])
                    cart.items.append(new_item)

        db.session.commit()
        return {'message': 'Cart updated successfully!'}, 200

    def delete(self, cart_id):
        cart = Carts.query.get(cart_id)
        if not cart:
            return {'message': 'Cart not found'}, 404

        # Assuming you want to delete associated cart items as well
        cart_items = Cart_items.query.filter_by(cart_id=cart.id).all()
        for item in cart_items:
            db.session.delete(item)

        db.session.delete(cart)
        db.session.commit()
        return {'message': 'Cart deleted successfully!'}, 200

# Add the CartResource to the API
api.add_resource(CartResource, '/api/carts/<int:cart_id>')
#=================================================================================================================================================

class DisplaySectionsResource(Resource):
    def get(self):
            # Query sections and associated products
        sections = Section.query.filter(Section.is_approved.is_(True), Section.products.any()).all()
        # Create a dictionary to store the result
        result = {}

        # Populate the dictionary with sections and their products
        for section in sections:
            section_data = {
                'id': section.S_id,
                'name': section.S_name,
                'products': [
                    {
                        'id': product.P_id,
                        'name': product.P_name,
                        'price': product.price,
                        'units': product.units,
                        'unit_type': product.unit_type,
                    } for product in section.products
                ]
            }
            result[section.S_name] = section_data

        # Return the result as JSON
        return jsonify(result)

class DisplayProductsResource(Resource):
    def get(self):
        sections = Section.query.all()

        # Create a dictionary to store the result
        result = {}

        # Populate the dictionary with sections and their products
        for section in sections:
            section_data = {
                'id': section.S_id,
                'name': section.S_name,
                'products': [
                    {
                        'id': product.P_id,
                        'name': product.P_name,
                        'price': product.price,
                        'units': product.units,
                        'unit_type': product.unit_type,
                    } for product in section.products
                ]
            }
            result[section.S_name] = section_data

        # Return the result as JSON
        return result

api.add_resource(DisplaySectionsResource, '/api/display_sections')
api.add_resource(DisplayProductsResource, '/api/display_products')

