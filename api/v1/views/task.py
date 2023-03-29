#!/usr/bin/python3
""" objects that handle all default RestFul API actions for States """
from models.task import Task
from models.folder import Folder
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from
from flask_jwt_extended import jwt_required, get_jwt_identity


'''@app_views.route('/task/all', methods=['GET'], strict_slashes=False)
@swag_from('documentation/task/get_state.yml', methods=['GET'])
def get_states():
    """
    Retrieves the list of all Task objects
    """
    all_states = storage.all(Task).values()
    list_states = []
    for task in all_states:
        list_states.append(task.to_dict())
    return jsonify(list_states)'''


@app_views.route('/task', methods=['GET'], strict_slashes=False)
#@swag_from('documentation/task/get_state.yml', methods=['GET'])
@jwt_required()
def get_states_by_uid():
    """
    Retrieves the list of all task created by a user
    """
    user_id = get_jwt_identity()
    task_in_folder = storage.get_task_by_folder_id_or_user_id(Task, user_id)
    list_task_in_folder = []
    for task in task_in_folder:
        list_task_in_folder.append(task.to_dict())
    return jsonify(list_task_in_folder)


@app_views.route('/task/<task_id>', methods=['GET'], strict_slashes=False)
#@swag_from('documentation/task/get_id_state.yml', methods=['get'])
@jwt_required()
def get_state(task_id):
    """ Retrieves a specific Task """
    task = storage.get(Task, task_id)
    if not task:
        abort(404)

    return jsonify(task.to_dict())


@app_views.route('/task/<task_id>', methods=['DELETE'],
                 strict_slashes=False)
#@swag_from('documentation/task/delete_state.yml', methods=['DELETE'])
@jwt_required()
def delete_state(task_id):
    """
    Deletes a Task Object
    """

    task = storage.get(Task, task_id)

    if not task:
        abort(404)

    storage.delete(task)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/task', methods=['POST'], strict_slashes=False)
#@swag_from('documentation/task/post_state.yml', methods=['POST'])
@jwt_required()
def post_task():
    """
    Creates a Task (WORKING)
    """
    user_id = get_jwt_identity()
    if not request.get_json():
        abort(400, description="Not a JSON")

    if 'task_name' not in request.get_json():
        abort(400, description="Missing task name")

    data = request.get_json()

    task_name = request.json.get('task_name', "")

    data["task_name"] = Task.rename(Task, data["folder_id"], task_name)
    if type(data["task_name"]) == dict and jsonify(data["task_name"]).json.get('error', False):
        return make_response({"error": jsonify(data["task_name"]).json.get("error")}, 425)

    data["user_id"] = user_id
    data["position"] = Task.set_task_position(Folder, data["folder_id"])
    instance = Task(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/task/<task_id>', methods=['PUT'], strict_slashes=False)
#@swag_from('documentation/task/put_state.yml', methods=['PUT'])
@jwt_required()
def put_state(task_id):
    """
    Updates a Task
    """
    task = storage.get(Task, task_id)

    if not task:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'created_at', 'updated_at']
    user_id = get_jwt_identity()
    data = request.get_json()
    if not task.task_name == data["task_name"]:
        task_name = request.json.get('task_name', "")

        data["task_name"] = Task.rename(Task, user_id, task_name)
        if type(data["task_name"]) == dict and jsonify(data["task_name"]).json.get('error', False):
            return make_response({"error": jsonify(data["task_name"]).json.get("error")}, 406)

    for key, value in data.items():
        if key not in ignore:
            setattr(task, key, value)
    task.save()
    return make_response(jsonify(task.to_dict()), 200)
