#!/usr/bin/python3
""" objects that handle all default RestFul API actions for Users """
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
from models.user import User
from models.folder import Folder


'''@app_views.route('/users/all', methods=['GET'], strict_slashes=False)
@swag_from('documentation/user/all_users.yml')
def get_all_users():
    """
    Retrieves the list of all user objects
    or a specific user
    """
    all_users = storage.all(User).values()
    list_users = []
    for user in all_users:
        list_users.append(user.to_dict())
    return jsonify(list_users)'''


@app_views.route('/users', methods=['GET'], strict_slashes=False)
@jwt_required()
@swag_from('documentation/user/get_user.yml', methods=['GET'])
def get_user():
    """ Retrieves user details"""
    user_id = get_jwt_identity()
    user = storage.get(User, user_id)
    if not user:
        abort(404)

    return jsonify(user.to_dict())


@app_views.route('/users', methods=['POST'], strict_slashes=False)
@swag_from('documentation/user/login_user.yml', methods=['POST'])
def login_user():
    """ Loguser in """
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    if email is None or password is None:
        # missing arguments
        abort(400, description="Missing email or password")
    if storage.get_user_by_email(email) is None:
        abort(400, description="Use dosent exist")    # existing user

    user = storage.get_user_by_email(email)

    if user is not None and user.verify_password(password) is True:
        token = user.generate_auth_token()
        # print(token)
        return jsonify(token)
    else:
        abort(401, description="invalied credentials")


@app_views.route('/users', methods=['DELETE'],
                 strict_slashes=False)
#@swag_from({'file': 'documentation/user/delete_user.yml'}, methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Deletes a user Object
    """
    user_id = get_jwt_identity()
    user = storage.get(User, user_id)

    if not user:
        abort(404)

    storage.delete(user)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/users/signup', methods=['POST'], strict_slashes=False)
@swag_from('documentation/user/post_user.yml', methods=['POST'])
def post_user():
    """
    Sign user up
    """
    if not request.get_json():
        abort(400, description="Not a JSON")

    if 'email' not in request.get_json():
        abort(400, description="Missing email")
    if 'password' not in request.get_json():
        abort(400, description="Missing password")

    data = request.get_json()
    email = data.get("email")

    if storage.get_user_by_email(email) is not None:
        abort(400, description="Existing user")

    first_name = data.get("first_name", "")
    last_name  = data.get("last_name ", "")

    data["first_name"] = first_name
    data["last_name"] = last_name
    
    instance = User(**data)
    important = Folder(folder_name="Important", position= 1, user_id= instance.id)
    task = Folder(folder_name="Tasks", position= 2, user_id= instance.id)
    
    instance.save()
    important.save()
    task.save()
    #print(instance.to_dict())
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/users', methods=['PUT'], strict_slashes=False)
@jwt_required()
@swag_from('documentation/user/put_user.yml', methods=['PUT'])
def put_user(user_id):
    """
    Updates a user details
    """
    user_id = get_jwt_identity()
    user = storage.get(User, user_id)

    if not user:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'email', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            setattr(user, key, value)
    user.save()
    return make_response(jsonify(user.to_dict()), 200)


@app_views.route('/users/refresh', methods=['GET'], strict_slashes=False)
@jwt_required(refresh=True)
def refresh_user_tokin():
    user_id = get_jwt_identity()
    user = storage.get(User, user_id)
    access = user.generate_auth_token("access")
    return make_response(access, 200)
