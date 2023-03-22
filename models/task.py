#!usr/bin/python3
"""User class"""
import models
from models.base_model import BaseModel, Base
from os import getenv
import sqlalchemy
from sqlalchemy import Column, String, ForeignKey, Integer, DateTime, JSON
from sqlalchemy.orm import relationship


class Task(BaseModel, Base):
    """Task class"""
    if models.storage_t == "db":
        __tablename__ = 'Task'
        user_id = Column(String(128), ForeignKey('users.id'), nullable=False)
        folder_id = Column(String(128), ForeignKey('folder.id'))
        task_name = Column(String(128), nullable=False)
        task_description = Column(String(500))
        is_checked = Column(Integer, default=0)
        is_important = Column(Integer, default=0)
        position = Column(Integer, default=0)
        reminder = Column(DateTime)
        due_date = Column(DateTime)
    else:
        user_id = ""
        folder_id = ""
        task_name = ""
        task_description = ""
        is_checked = ""
        is_important = ""
        position = ""
        reminder = ""
        due_date = ""

    def __init__(self, *args, **kwargs):
        """initializes user"""
        super().__init__(*args, **kwargs)
