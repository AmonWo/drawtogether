from flask import Flask

app = Flask(__name__)

app.config['MONGODB_SETTINGS'] = {
    'db': 'users',
    'host': '127.0.0.1',
    'port': 27017
}

from app import routes




