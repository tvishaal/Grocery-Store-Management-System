from flask import Flask, request, render_template, jsonify, send_file  # Import Flask to allow us to create our app
from flask_security import SQLAlchemyUserDatastore, Security
from models import db, User, Role, Section, Product, Carts, Cart_items
from resources import section_parser, section_fields, product_fields
from config import DevelopmentConfig
from flask_security import  login_required, auth_required, roles_required,current_user

from resources import api
from flask_restful import marshal, fields
import worker
import flask_excel as excel
from tasks import create_resource_csv
from flask import Flask, send_file
from celery import Celery
from celery.result import AsyncResult
from celery.schedules import crontab
from tasks import daily_remainder
from tasks import *
from instance import cache

datastore = SQLAlchemyUserDatastore(db, User, Role)


def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app) 
    excel.init_excel(app)#ins
    app.security = Security(app,datastore)
    cache.init_app(app)
    with app.app_context():
        # Only create tables if they do not exist
        db.create_all()
        datastore.find_or_create_role(name="admin", description="User is an admin")
        datastore.find_or_create_role(name="manager", description="User is a manager")  # Fixed typo
        datastore.find_or_create_role(name="customer", description="User is a customer")
        # Check if the 'admin' user exists, and create it if not
        if not datastore.find_user(email='admin'):
            datastore.create_user(email='admin', password='admin', roles = ['admin'])
        db.session.commit()  # Corrected the missing parentheses here
    celery=worker.celery
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"],
        broker_connection_retry_on_startup=True,
        timezone = 'Asia/Kolkata'
    )

    celery.Task=worker.ContextTask
    app.app_context().push()
    return app,celery



app,celery = create_app()







@app.route('/')
def login():
    return render_template('index.html')


@auth_required('token')
@app.route('/logout', methods=['POST'])
def logout():
    use_id = current_user.id
    user = User.query.filter_by(id=use_id).first()

    # Assuming 'lastlogin' is the correct attribute to update
    user.lastlogin = datetime.datetime.now()

    db.session.commit()
    return jsonify({"message": "logout successful"})

@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('Email')
    password = data.get('Password')
    
    if not email:
        return jsonify({"message": "Email not provided"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User not found"}), 404

    if user and user.password == password:
        return jsonify({
    "token": user.get_auth_token(),
    "user_id": user.id,
    "name": user.name,
    "username": user.username,
    "email": user.email,
    "phone": user.phone,
    "address": user.address,
    "role": user.roles[0].name,
}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401



@app.post('/create/user')
def create_user():
    data = request.get_json()
    email = data.get('email')
    user = datastore.find_user(email=email)
    lis=[]
    lis.append(data.get('role'))
    # Basic validation
    required_fields = ['username', 'password', 'name', 'phone', 'email', 'address', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Incomplete user data'}), 400

    # Check if the username already exists (you may want to improve this check)
    if user:
        return jsonify({'message': 'Email already exists'}), 400
    
    else:
        datastore.create_user(username=data.get('username'), password=data.get('password'), name=data.get('name'),phone = data.get('phone'),email = data.get('email'), address = data.get('address'), roles = lis)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 200



manager_field = {
    "id":fields.Integer,
    "email":fields.String,
    "active":fields.Boolean,
}
@cache.cached(timeout=1)
@app.get('/allmanagers')
def get():
    managers = User.query.filter(User.roles.any(Role.name == 'manager')).order_by(User.name).all()
    if len(managers) == 0: 
        return jsonify({'message': 'No managers found'}), 404
    else:
        return marshal(managers,manager_field)





@auth_required("token")
@roles_required("admin")
@app.post('/activate/manager/<int:manager_id>')
def activate_manager(manager_id):
    manager = User.query.get(manager_id)
    if not manager:
        return jsonify({'message': 'Manager not found'}), 404
    else:
        manager.active = True
        db.session.commit()
        return jsonify({'message': 'Manager activated successfully'}), 200

@auth_required("token")
@roles_required("admin")
@app.post('/deactivate/manager/<int:manager_id>')
def deactivate_manager(manager_id):
    manager = User.query.get(manager_id)
    if not manager:
        return jsonify({'message': 'Manager not found'}), 404
    else:
        manager.active = False
        db.session.commit()        
        return jsonify({'message': 'Manager deactivated successfully'}), 200


@auth_required("token")
@roles_required('admin', 'manager')
@app.post('/create-section')
def create_section():
    data = section_parser.parse_args()

    # Check if the section name already exists
    existing_section = Section.query.filter_by(S_name=data['name']).first()
    if existing_section:
        return {'message': 'Section name already exists. Choose a different name.'}, 400  # 400 status code for bad request
    else:
        new_section = Section(S_name=data['name'], creator_id=data['creator_id'], is_approved= False )

    try:
        db.session.add(new_section)
        db.session.commit()
        return {'message': 'Section request sent. Wait for approval'}, 201  # 201 status code for resource creation
    except Exception as e:
        return {'message': f'Error creating section: {str(e)}'}, 500  # 500 status code for internal server error



section_fields = {
    'id': fields.Integer(attribute='S_id'),
    'name': fields.String(attribute='S_name'),
    'creator_id': fields.Integer,
    'is_approved': fields.Boolean,
}

@auth_required("token")
@roles_required('admin', 'manager')
@app.route('/all_sections', methods=['GET'])
def all_sections():
    all_sections = Section.query.all()
    return marshal(all_sections, section_fields )



@auth_required("token")
@roles_required('admin', 'manager')
@app.route('/approved_sections', methods=['GET'])
def approved_sections():
    try:
        # Query only approved sections
        approved_sections = Section.query.filter_by(is_approved=True).all()
        return marshal(approved_sections, section_fields)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required("token")
@roles_required('admin', 'manager')
@app.route('/approve/section/<int:section_id>', methods=['POST'])
def approve_section(section_id):
    section = Section.query.get(section_id)
    if section:
        section.is_approved = True

        try:
            db.session.commit()
            return jsonify({'message': 'Section approved successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error approving section: {str(e)}'}), 500

    return jsonify({'message': 'Section not found'}), 404

@auth_required("token")
@roles_required('admin',)
@app.route('/deactivate/section/<int:section_id>', methods=['POST'])
def deactivate_section(section_id):
    section = Section.query.get(section_id)
    if section:
        section.is_approved = False  
        try:
            db.session.commit()
            return jsonify({'message': 'Section deactivated successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error deactivating section: {str(e)}'}), 500

    return jsonify({'message': 'Section not found'}), 404


@auth_required("token")
@roles_required('admin')
@app.route('/delete/section/<int:section_id>', methods=['POST'])
def delete_section(section_id):
    section = Section.query.get(section_id)
    if section:
        try:
            db.session.delete(section)
            db.session.commit()
            return jsonify({'message': 'Section deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error deactivating section: {str(e)}'}), 500

    return jsonify({'message': 'Section not found'}), 404

@auth_required("token")
@roles_required('manager')
@app.route('/add_product/<int:section_id>', methods=['POST'])
def add_product_to_section(section_id):
    section = Section.query.get(section_id)
    
    if section:
        try:
            product_data = request.json             
            new_product = Product(
                P_name=product_data.get('name'),
                price=product_data.get('price'),
                P_section=section_id,  # Assuming 'section.id' is the ID of the associated section
                units=product_data.get('units', 0),
                unit_type=product_data.get('unit_type', ''),
            )

            db.session.add(new_product)
            db.session.commit()
            
            return jsonify({'message': 'Product added successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error adding product: {str(e)}'}), 500

    return jsonify({'message': 'Section not found'}), 404

@auth_required("token")
@roles_required('manager')
@app.route('/product/<int:section_id>', methods=['GET','DELETE'])
def all_products(section_id):
    if request.method == 'GET':
        # Query all products based on the provided section ID
        all_products = Product.query.filter_by(P_section=section_id).all()

        if not all_products:
            return jsonify({"message": "No products found"})
        else:
            # Do something with the retrieved products and return a response
            return marshal(all_products, product_fields), 200

    elif request.method == 'DELETE':
        # Handle DELETE request logic here
        return jsonify({"message": "DELETE request handled"}), 200

@auth_required("token")
@roles_required('admin', 'manager')
@app.route('/allsection/<int:creator_id>', methods=['GET'])
def manager_section(creator_id):
        # Query all sections based on the provided creator ID
        all_sections = Section.query.filter_by(creator_id=creator_id).all()
        return marshal(all_sections, section_fields)


@auth_required("token")
@roles_required("customer")
@app.route('/api/place_order', methods=['POST'])
def create_cart():
    try:
        # Get user_id from the request or your authentication system
        user_id = request.json.get('user_id')
        if user_id is None:
            return jsonify({'error': 'user_id is required'}), 400

        # Create a new cart for the user
        new_cart = Carts(user_id=user_id)
        db.session.add(new_cart)
        db.session.commit()

        # Get the newly created cart_id
        cart_id = new_cart.id

        # Add products to Cart_items and update product quantities
        products = request.json.get('products')
        for product in products:
            new_item = Cart_items(
                cart_id=cart_id,
                name=product['name'],
                item_productId=product['item_productId'],
                price=product['price'],
                quantity=product['quantity']
            )
            db.session.add(new_item)

            # Update product quantity in the Products table
            product_id = product['item_productId']
            product_db = Product.query.get(product_id)
            if product_db:
                if product_db.units >= product['quantity']:
                    product_db.units -= product['quantity']
                else:
                    db.session.rollback()
                    return jsonify({'error': 'Insufficient quantity for product: ' + product['name']}), 400

        db.session.commit()

        return jsonify({'message': 'Cart created successfully', 'cart_id': cart_id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_required("token")
@roles_required('customer')
@app.route('/api/get_cart_items/<int:user_id>', methods=['GET'])
def get_cart_items(user_id):
    try:
        # Query all cart items for the given user_id
        cart_items = Cart_items.query.join(Carts).filter(Carts.user_id == user_id).all()

        # Group cart items by cart_id
        grouped_cart_items = {}
        for cart_item in cart_items:
            if cart_item.cart_id not in grouped_cart_items:
                grouped_cart_items[cart_item.cart_id] = {
                    'cart_id': cart_item.cart_id,
                    'user_id': cart_item.cart.user_id,
                    'items': []
                }

            grouped_cart_items[cart_item.cart_id]['items'].append({
                'name': cart_item.name,
                'item_productId': cart_item.item_productId,
                'price': cart_item.price,
                'quantity': cart_item.quantity
            })

        # Convert the dictionary to a list of grouped cart items
        result = list(grouped_cart_items.values())

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@auth_required("token")
@roles_required('customer')
@app.route('/search_products/<search_term>', methods=['GET'])
def search_products(search_term):
    matching_products = Product.query.filter(
        (Product.name.ilike(f"%{search_term}%")) | (Product.price.ilike(f"%{search_term}%"))
    ).all()

    result = [{'name': product.name, 'price': product.price, 'section': product.section.name} for product in matching_products]
    return jsonify(result)


@auth_required("token")
@roles_required('customer')
@app.route('/search_sections/<search_term>', methods=['GET'])
def search_sections(search_term):
    matching_sections = Section.query.filter(Section.name.ilike(f"%{search_term}%")).all()

    result = [{'name': section.name, 'products': [product.name for product in section.products]} for section in matching_sections]
    return jsonify(result)

#==============================================================================================================================================#
@auth_required("token")
@roles_required('admin', 'manager')
@app.get('/download-csv')
def download_csv():
    task = create_resource_csv.delay()
    return jsonify({
        "task_id": task.id
    })

@auth_required("token")
@roles_required('admin', 'manager')
@app.get('/download-manager-csv')
def download_manager_csv():
    task = create_manager_csv.delay()
    return jsonify({
        "task_id": task.id,
    })

@auth_required("token")
@roles_required('admin', 'manager')
@app.get('/download-customer-csv')
def download_customer_csv():
    task = create_customer_csv.delay()
    return jsonify({
        "task_id": task.id,
    })

@auth_required("token")
@roles_required('admin', 'manager')
@app.get('/download-order-csv')
def download_order_csv():
    task = create_order_csv.delay()
    return jsonify({
        "task_id": task.id,
    })

@auth_required("token")
@roles_required('admin', 'manager')
@app.get('/download-section-csv/<int:section_id>')
def download_section_csv(section_id):
    task = create_section_product_csv.delay(section_id)
    return jsonify({
        "task_id": task.id,
    })
#==============================================================================================================================================#
@auth_required("token")
@roles_required('admin', 'manager')
@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)

    else:
        return {"message":"pending"}, 404
if __name__ == '__main__':
    app.run(debug=True)
