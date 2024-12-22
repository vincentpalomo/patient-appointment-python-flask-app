# app.py
from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from models import db
from routes import api
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
app.register_blueprint(api)

if __name__ == '__main__':
    app.run(debug=True)