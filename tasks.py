from worker import celery
from models import User,Role,Product,Carts,Cart_items
import flask_excel as excel
from mail_service import send_message
from celery.schedules import crontab
from datetime import datetime,timedelta
from jinja2 import Template

@celery.on_after_finalize.connect
def set_up_daily_task(sender, **kwargs):
   sender.add_periodic_task(crontab(hour=19, minute=59),send_daily_email.s(),name="send_email_task")

@celery.on_after_finalize.connect
def set_up_monthly_task(sender, **kwargs):
    sender.add_periodic_task(crontab(day_of_month='14', hour=19, minute=59),send_monthly_email.s(),name="send_monthly_email")



@celery.task
def send_daily_email():
    user=User.query.all()
    for i in user:
        if datetime.now() - i.lastlogin >= timedelta(hours=24):
            with open('templates/dailymail.html') as file_:
                template = Template(file_.read())
                message = template.render(name=i.username, lastvisited=i.lastlogin)

            send_message(
                to=i.email,
                subject="Visit Alert",
                message=message
            )
    return "Emails have been sent to users who haven't visited in 24 hours!"

@celery.task
def send_monthly_email():
    user=User.query.all()
    for i in user:
        cart=Carts.query.filter_by(user_id=i.id).first()
        if cart is None:
            continue
        cart_items=cart.items
        with open('templates/monthlymail.html') as file_:
                template = Template(file_.read())
                message = template.render(name=i.username, items=cart_items)


        send_message(
            to=i.email,
            subject="Monthly Alert",
            message=message
        )
    return "Emails have been sent"

@celery.task
def create_resource_csv():
    # Retrieve all columns from the Product table
    products = Product.query.all()

    # Extract column names dynamically
    column_names = [col.name for col in Product.__table__.columns]

    # Generate CSV response
    csv_output = excel.make_response_from_query_sets(
        products, column_names, "csv", filename="products.csv"
    )

    filename = "products.csv"
    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename



@celery.task
def create_manager_csv():
    # Assuming you have a User model with roles
    managers = User.query.filter(User.roles.any(Role.name == 'manager')).with_entities(User.id, User.name, User.email).all()

    column_names=["id","name","email"]
    # Generate CSV response
    csv_output = excel.make_response_from_query_sets(
        managers, column_names, "csv", filename="managers.csv"
    )

    filename = "managers.csv"
    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename



@celery.task
def create_customer_csv():
    # Assuming you have a User model with roles
    managers = User.query.filter(User.roles.any(Role.name == 'customer')).with_entities(User.id, User.name, User.email).all()

    column_names=["id","name","email"]
    # Generate CSV response
    csv_output = excel.make_response_from_query_sets(
        managers, column_names, "csv", filename="customer.csv"
    )

    filename = "customer.csv"
    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename


@celery.task
def create_order_csv():
    # Assuming you have a User model with roles
    orders = Cart_items.query.with_entities(Cart_items.id, Cart_items.name, Cart_items.price,Cart_items.quantity).all()

    column_names=["id","name","price","quantity"]
    # Generate CSV response
    csv_output = excel.make_response_from_query_sets(
        orders, column_names, "csv", filename="orders.csv"
    )

    filename = "orders.csv"
    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename

@celery.task
def create_section_product_csv(section_id):
    # Assuming you have a User model with roles
    all_products = Product.query.filter_by(P_section=section_id).all()

  # Extract column names dynamically
    column_names = [col.name for col in Product.__table__.columns]

    # Generate CSV response
    csv_output = excel.make_response_from_query_sets(
        all_products, column_names, "csv", filename="products.csv"
    )

    filename = "products.csv"
    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename



@celery.task
def daily_remainder(to, subject):
    send_message(to, subject, "hello")
    return "OK"

