from main import *
from models import *





if not datastore.find_user(username='admin'):
    datastore.create_user(username='admin', password='admin' )
db.session.commit