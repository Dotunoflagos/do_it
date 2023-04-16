#!/usr/bin/python3
"""
This is the base moedl for all classes
"""
from datetime import datetime
import models
from os import getenv
import sqlalchemy
from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
import uuid
import re

time = "%Y-%m-%dT%H:%M:%S.%f"
if models.storage_t == "db":
    Base = declarative_base()
else:
    Base = object


class BaseModel:
    """
    This is the base moedl for all classes
    """
    if models.storage_t == "db":
        id = Column(String(60), primary_key=True)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow)

    def __init__(self, *args, **kwargs):
        """Initialization of the base model"""
        if kwargs:
            for key, value in kwargs.items():
                if key != "__class__":
                    setattr(self, key, value)
            if kwargs.get("created_at", None) and type(self.created_at) is str:
                self.created_at = datetime.strptime(kwargs["created_at"], time)
            else:
                self.created_at = datetime.utcnow()
            if kwargs.get("updated_at", None) and type(self.updated_at) is str:
                self.updated_at = datetime.strptime(kwargs["updated_at"], time)
            else:
                self.updated_at = datetime.utcnow()
            if kwargs.get("id", None) is None:
                self.id = str(uuid.uuid4())
        else:
            self.id = str(uuid.uuid4())
            dateString = datetime.utcnow()
            self.created_at = dateString
            self.updated_at = dateString
            """models.storage.new(self)"""

    """def __setattr__(self, key, value):
        self.__dict__[key] = value
        models.storage.new(self)"""

    def save(self):
        self.updated_at = datetime.utcnow()
        models.storage.new(self)
        models.storage.save()

    def to_dict(self, save_fs=None):
        """returns a dictionary containing all keys/values of the instance"""
        new_dict = self.__dict__.copy()
        if "created_at" in new_dict:
            new_dict["created_at"] = new_dict["created_at"].strftime(time)
        if "updated_at" in new_dict:
            new_dict["updated_at"] = new_dict["updated_at"].strftime(time)
        new_dict["__class__"] = self.__class__.__name__
        if "_sa_instance_state" in new_dict:
            del new_dict["_sa_instance_state"]
        if save_fs is None:
            if "password" in new_dict:
                del new_dict["password"]
        return new_dict

    def __str__(self):
        return f'[{self.__class__.__name__}] ({self.id}) {self.__dict__}'

    def delete(self):
        """delete the current instance from the storage"""
        models.storage.delete(self)

    @staticmethod
    def rename(cls, user_id, oldname="Item"):
        class_name = cls
        if models.storage.get_by_id_and_name(class_name, user_id, oldname) is not None:
            try:
                clss = {"Task": "task_name", "Folder": "folder_name"}
                pattern = r"\s\(\d+\)$"
                match = re.search(pattern, oldname)

                if match:
                    replace = match.group().replace(" ", "")  # Extract (n)
                    # Extract the value of n from the regex match
                    folder_number = int(replace[1])
                    if folder_number >= 9:
                        raise Exception(
                            "Too much occurence of the same name!!!")
                    name = oldname.rstrip(replace)
                    newname = name + "({})".format(folder_number + 1)
                else:
                    newname = oldname + " (1)"

                check = models.storage.get_by_id_and_name(
                    class_name, user_id, newname)
                if check:
                    return cls.rename(class_name, user_id, eval(f'check.{clss[cls.__name__]}'))
                return newname
            except Exception as e:
                return {"error": str(e)}
        return oldname

    @staticmethod
    def set_task_position(cls, id=None):
        no = 1
        if id:
            objs = models.storage.get_task_by_folder_id_or_user_id(cls, id)
            if objs:
                no = len(objs) + 1
        return no

    @staticmethod
    def set_folder_position(id=None):
        no = 1
        if id:
            objs = models.storage.get_folders_by_user_id(id)
            if objs:
                no = len(objs) + 1
        return no


    def toggle_case(self, flag):
        clss = {"Folder": "folder_name", "Task": "task_name"}
        clasz = type(self).__name__
        word = eval(f'self.{clss[clasz]}')
        first_letter = word[0]
        rest_of_word = word[1:]

        if flag == 'U':
            self.__dict__[clss[clasz]] =  first_letter.upper() + rest_of_word
            return self
        elif flag == 'L':
            self.__dict__[clss[clasz]] =  first_letter.lower() + rest_of_word
            return self
        elif flag == 'A':
            if first_letter == first_letter.lower():
                first_letter = first_letter.upper()
            else:
                first_letter = first_letter.lower()
            self.__dict__[clss[clasz]] = first_letter + rest_of_word
            return self
        else:
            self.__dict__[clss[clasz]] = word
            return self
