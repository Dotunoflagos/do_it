#!/usr/bin/python3
"""
Contains the class DBStorage
"""

import models
from models.base_model import BaseModel, Base
from os import getenv
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from models.user import User
from models.task import Task
from models.folder import Folder

classes = {"BaseModel": BaseModel, "User": User,
           "Task": Task, "Folder": Folder}


class DBStorage:
    """interaacts with the MySQL database"""
    __engine = None
    __session = None

    def __init__(self):
        """Instantiate a DBStorage object"""
        HBNB_MYSQL_USER = getenv('HBNB_MYSQL_USER')
        HBNB_MYSQL_PWD = getenv('HBNB_MYSQL_PWD')
        HBNB_MYSQL_HOST = getenv('HBNB_MYSQL_HOST')
        HBNB_MYSQL_DB = getenv('HBNB_MYSQL_DB')
        HBNB_ENV = getenv('HBNB_ENV')
        self.__engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'.
                                      format(HBNB_MYSQL_USER,
                                             HBNB_MYSQL_PWD,
                                             HBNB_MYSQL_HOST,
                                             HBNB_MYSQL_DB), pool_pre_ping=True)
        if HBNB_ENV == "test":
            Base.metadata.drop_all(self.__engine)

    def all(self, cls=None):
        """query on the current database session"""
        new_dict = {}
        for clss in classes:
            if cls is None or cls is classes[clss] or cls is clss:
                objs = self.__session.query(classes[clss]).all()
                for obj in objs:
                    key = obj.__class__.__name__ + '.' + obj.id
                    new_dict[key] = obj
        return (new_dict)

    def new(self, obj):
        """add the object to the current database session"""
        self.__session.add(obj)

    def save(self):
        """commit all changes of the current database session"""
        self.__session.commit()

    def delete(self, obj=None):
        """delete from the current database session obj if not None"""
        if obj is not None:
            self.__session.delete(obj)

    def reload(self):
        """reloads data from the database"""
        Base.metadata.create_all(self.__engine)
        sess_factory = sessionmaker(bind=self.__engine, expire_on_commit=False)
        Session = scoped_session(sess_factory)
        self.__session = Session

    def close(self):
        """call remove() method on the private session attribute"""
        self.__session.remove()

    def get(self, cls, id):
        """retrieves an object of a class with id"""
        obj = None
        if cls is not None and issubclass(cls, BaseModel):
            obj = self.__session.query(cls).filter(cls.id == id).first()
        return obj

    def get_user_by_email(self, email):
        """retrieves user by email"""
        obj = None
        if email is not None:
            obj = self.__session.query(User).filter(
                User.email == email).first()
        return obj

    def get_folders_by_user_id(self, user_id):
        """retrieves folder by by folderid"""
        obj = None
        if user_id is not None:
            obj = self.__session.query(Folder).filter(
                Folder.user_id == user_id).order_by(Folder.position.desc()).all()
        return obj

    '''def get_task_by_folder_id(self, folder_id):
        """retrieves task by folder id"""
        obj = None
        if folder_id is not None:
            obj = self.__session.query(Task).filter(
                Task.folder_id == folder_id).all()
        return obj

    def get_task_by_user_id(self, user_id):
        """retrieves task by folder id"""
        obj = None
        if user_id is not None:
            obj = self.__session.query(Task).filter(
                Task.user_id == user_id).all()
        return obj'''

    def get_task_by_folder_id_or_user_id(self, cls, id):
        """retrieves task by folder_id or user_id"""
        clss = {"Task": "user_id", "Folder": "folder_id"}
        obj = None
        if id is not None and cls.__name__ in ["Task", "Folder"]:
            obj = self.__session.query(Task).filter(
                eval(f'Task.{clss[cls.__name__]}') == id).order_by(Task.position.asc()).all()
        return obj
    
    def get_by_id_and_name(self, cls, user_id, name):
        """retrieves task or folders by name and userid"""
        clss = {"Task": "task_name", "Folder": "folder_name"}
        clss2 = {"Task": "folder_id", "Folder": "user_id"}
        #print(f'{cls.__name__}.{clss[cls.__name__]}')
        #print(f'{cls.__name__}.{clss2[cls.__name__]} == {clss2[cls.__name__]}')
        obj = None
        if name is not None:
            obj = self.__session.query(cls).filter(
                eval(f'{cls.__name__}.{clss[cls.__name__]}') == name, 
                eval(f'{cls.__name__}.{clss2[cls.__name__]}') == user_id).first()
        return obj

    def count(self, cls=None):
        """retrieves the number of objects of a class or all (if cls==None)"""
        return len(self.all(cls))
