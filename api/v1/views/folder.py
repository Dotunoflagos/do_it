#!/usr/bin/python3
""" objects that handle all default RestFul API actions for Places """
from models.user import User
from models.task import Task
from models.folder import Folder
from models.user import User
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from
from flask_jwt_extended import jwt_required, get_jwt_identity


@app_views.route('/folder', methods=['GET'],
                 strict_slashes=False)
#@swag_from('documentation/place/get_places.yml', methods=['GET'])
@jwt_required()
def get_places():
    """
    Retrieves the list of all Folder objects by user id
    """
    user_id = get_jwt_identity()
    all_folder = storage.get_folders_by_user_id(user_id)
    list_folder = []
    for folder in all_folder:
        list_folder.append(folder.to_dict())
    return jsonify(list_folder)


@app_views.route('/folder/<folder_id>/all_task', methods=['GET'], strict_slashes=False)
#@swag_from('documentation/place/get_place.yml', methods=['GET'])
@jwt_required()
def get_folders_task(folder_id):
    """
    Get task that belongs to a folder
    """
    task_in_folder = storage.get_task_by_folder_id_or_user_id(Folder, folder_id)
    list_task_in_folder = []
    for task in task_in_folder:
        list_task_in_folder.append(task.toggle_case("U").to_dict())
    return jsonify(list_task_in_folder)


@app_views.route('/folder/<folder_id>', methods=['DELETE'],
                 strict_slashes=False)
#@swag_from('documentation/place/delete_place.yml', methods=['DELETE'])
@jwt_required()
def delete_place(folder_id):
    """
    Deletes a folder
    """

    folder = storage.get(Folder, folder_id)

    if not folder:
        abort(404)

    task_in_folder = storage.get_task_by_folder_id_or_user_id(Folder, folder_id)
    for task in task_in_folder:
         storage.delete(task)
         storage.save()

    storage.delete(folder)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/folder', methods=['POST'],
                 strict_slashes=False)
#@swag_from('documentation/place/post_place.yml', methods=['POST'])
@jwt_required()
def post_place():
    """
    Creates a folder
    """
    user_id = get_jwt_identity()
    if not request.get_json():
        abort(400, description="Not a JSON")

    if 'folder_name' not in request.get_json():
        abort(400, description="Missing folder name")

    data = request.get_json()

    folder_name = request.json.get('folder_name', "")

    data["folder_name"] = Folder.rename(Folder, user_id, folder_name)
    if type(data["folder_name"]) == dict and jsonify(data["folder_name"]).json.get('error', False):
        return make_response({"error" : jsonify(data["folder_name"]).json.get("error")}, 406)

    data["user_id"] = user_id
    data["position"] = Folder.set_folder_position(user_id)
    instance = Folder(**data)
    instance.toggle_case("U").save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/folder/<folder_id>', methods=['PUT'], strict_slashes=False)
#@swag_from('documentation/place/put_place.yml', methods=['PUT'])
@jwt_required()
def put_place(folder_id):
    """
    Updates a Folder name
    """
    folder = storage.get(Folder, folder_id)
    user_id = get_jwt_identity()
    
    if not folder:
        abort(404)

    data = request.get_json()
    if not data:
        abort(400, description="Not a JSON")
    
    if not folder.folder_name == data["folder_name"]:
        folder_name = request.json.get('folder_name', "")

        data["folder_name"] = Task.rename(Folder, user_id, folder_name)
        if type(data["folder_name"]) == dict and jsonify(data["folder_name"]).json.get('error', False):
            return make_response({"error": jsonify(data["folder_name"]).json.get("error")}, 406)


    ignore = ['id', 'user_id', 'folder_id', 'created_at', 'updated_at']

    for key, value in data.items():
        if key not in ignore:
            setattr(folder, key, value)
    folder.toggle_case("U").save()
    return make_response(jsonify(folder.to_dict()), 200)
