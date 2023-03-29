#!usr/bin/python3
"""User class"""
import models
from models.base_model import BaseModel, Base
from os import getenv
import sqlalchemy
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from itsdangerous import Serializer, BadSignature, SignatureExpired
from flask_jwt_extended import create_access_token, create_refresh_token
from flask import jsonify


class User(BaseModel, Base):
    """Representation of a user """
    if models.storage_t == 'db':
        __tablename__ = 'users'
        email = Column(String(128), nullable=False)
        password = Column(String(128), nullable=False)
        first_name = Column(String(128), nullable=True)
        last_name = Column(String(128), nullable=True)
        Folder = relationship("Folder", backref="user")
        Task = relationship("Task", backref="user")
    else:
        email = ""
        password = ""
        first_name = ""
        last_name = ""

    def __init__(self, *args, **kwargs):
        """initializes user"""
        super().__init__(*args, **kwargs)

    def verify_password(self, password):
        if password == self.password:
            return True
        else:
            return False

    def generate_auth_token(self, ref=None):
        if ref is None:
            refresh = create_refresh_token(identity=self.id)
            access = create_access_token(identity=self.id)
            return {
                'user': {
                    'refresh': refresh,
                    'access': access,
                    'first_name': self.first_name,
                    'last_name': self.last_name,
                    'full_name': self.last_name + " " + self.first_name,
                    'email': self.email,
                    'id': self.id
                }
            }
        else:
            access = create_access_token(identity=self.id)
            return {'access': access}
        # s = Serializer('the quick brown fox jumps over the lazy dog')
        # return s.dumps({'id': self.id})
