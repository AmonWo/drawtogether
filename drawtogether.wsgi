#!/usr/bin/python3
import sys
import logging
from app import app as application

logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, "/var/www/vhosts/app.amonwondra.de/drawtogether/app")

application.secret_key = 'Add your secret key'

activate_this = '/var/www/vhosts/app.amonwondra.de/drawtogether/myvenv/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

