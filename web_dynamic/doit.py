#!/usr/bin/python3
""" Starts a Flash Web Application """
from flask import Flask, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_jwt_extended import JWTManager
from flask import jsonify, redirect
from models import storage
from models.user import User
from models.task import Task
from models.folder import Folder
from os import environ
import uuid
app = Flask(__name__)
'''app.secret_key = "ywebwyedbwyhbedbw"'''
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.config['JWT_SECRET_KEY'] = 'super-secret'
# app.jinja_env.trim_blocks = True
# app.jinja_env.lstrip_blocks = True

@app.teardown_appcontext
def close_db(error):
    """ Remove the current SQLAlchemy Session """
    storage.close()
    
@app.route('/', strict_slashes=False)
def landing():
    
    return render_template('landing.html',
                           cache_id=uuid.uuid4())


@app.route('/signup/', strict_slashes=False)
def signup():
    
    return render_template('signup.html',
                           cache_id=uuid.uuid4())


@app.route('/login/', strict_slashes=False, methods=['POST', 'GET'])
def login():
    
    return render_template('login.html',
                           cache_id=uuid.uuid4())

@app.route('/dashboard/')
@app.route('/dashboard/<user_id>', strict_slashes=False, methods=['POST', 'GET'])
def dashboard(user_id=None):
    all_folder = storage.get_folders_by_user_id(user_id)
    
    if user_id is None or all_folder in (None, []):
        return redirect('/login/')
    
    def find_object_by_name(objects, folder_name):
        for obj in objects:
            if obj["folder_name"] == folder_name:
                return obj["id"]
        return None

    #user_id = get_jwt_identity()
    #user_id = "7c0e2414-f68c-494c-ac98-5cffce577861"
    list_folder = []
    
    for folder in all_folder:
        list_folder.append(folder.to_dict())

    important = find_object_by_name(list_folder, "important")
    alla = find_object_by_name(list_folder, "all")
    completed = find_object_by_name(list_folder, "completed")
    task = find_object_by_name(list_folder, "task")
    
    return render_template('dashboard.html',
                           cache_id=uuid.uuid4(),
                           important=important,
                           all=alla,
                           completed=completed,
                           task=task,
                           obj =list_folder)

JWTManager(app)
if __name__ == "__main__":
    """ Main Function """
    app.run(host='0.0.0.0', port=5000)
