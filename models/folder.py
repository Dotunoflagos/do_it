#!usr/bin/python3
"""User class"""
import models
from models.base_model import BaseModel, Base
from os import getenv
import sqlalchemy
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Table
from sqlalchemy.orm import relationship


class Folder(BaseModel, Base):
    """folder class"""
    if models.storage_t == "db":
        __tablename__ = 'folder'
        user_id = Column(String(128), ForeignKey('users.id'), nullable=False)
        folder_name = Column(String(128), nullable=False)
        position = Column(Integer, default=0)
        '''Task = relationship("Task", backref="folder")'''
    else:
        folder_name = ""
        user_id = ""
        #position = ""

    def __init__(self, *args, **kwargs):
        """initializes user"""
        super().__init__(*args, **kwargs)
