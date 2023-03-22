#!/usr/bin/python3
"""Fils storage module"""
import json
from models.base_model import BaseModel
from models.user import User
from models.task import Task
from models.folder import Folder

classes = {"BaseModel": BaseModel, "User": User, "Task": Task, "Folder": Folder}


class FileStorage:
    """serializes instances to a JSON file & deserializes back to instances"""
    __file_path = "file.json"
    __objects = {}

    def all(self):
        """returns the dictionary __objects"""

        if self.__objects is not None and len(self.__objects) != 0:
            newdic = {}
            for key, value in self.__objects.items():
                newdic[key] = value
            return newdic
        return self.__objects

    def new(self, obj):
        """sets in __objects the obj with key <obj class name>.id"""
        if obj is not None:
            key = obj.__class__.__name__ + "." + obj.id
            self.__objects[key] = obj

    def save(self):
        """serializes __objects to the JSON file (path: __file_path)"""
        json_objects = {}
        for key in self.__objects:
            json_objects[key] = self.__objects[key].to_dict()
        with open(self.__file_path, 'w') as f:
            json.dump(json_objects, f)

    def reload(self):
        """deserializes the JSON file to __objects"""
        try:
            with open(self.__file_path, 'r') as f:
                str = json.load(f)
            for key in str:
                self.__objects[key] = \
                    classes[str[key]["__class__"]](**str[key])
        except Exception:
            pass
