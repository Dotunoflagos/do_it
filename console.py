#!/usr/bin/python3
"""
Console class
"""
import cmd
import models
from models.base_model import BaseModel
from models.folder import Folder
from models.task import Task
from models.user import User
import json
import re

classes = {"BaseModel": BaseModel, "User": User, "Folder": Folder, "Task": Task}


class HBNBCommand(cmd.Cmd):
    """
    Comand line class
    """

    prompt = '(hbnb) '

    def do_EOF(self, line):
        """EOF command to exit the program
        """

        return True

    def do_quit(self, line):
        """Quit command to exit the program
        """

        return True

    def emptyline(self):
        """ overwriting the emptyline method """
        return False

    def do_create(self, line):
        """
        Behaviour:
            Creates A new class

        usage:
            **
            classname:
                [BaseModel, User, Place, Review, State, City, Amenity]
            **
            (hbnb) create <classname>
        """

        if line in classes:
            my_model = classes[line]()
            my_model.save()
            print(my_model.id)
        elif line == "":
            print("** class name missing **")
        else:
            print("** class doesn't exist **")

    def do_show(self, line):
        """
        Behaviour:
            Prints A class by <classname> <id>

        usage:
            **
            classname:
                [BaseModel, User, Place, Review, State, City, Amenity]
            **
            (hbnb) show <classname> <id>
        """

        if line == "":
            print("** class name missing **")
        elif line.split(" ")[0] not in classes:
            print("** class doesn't exist **")
        elif len(line.split(" ")) == 1:
            print("** instance id missing **")
        elif line.count(" ") == 1:
            key = line.replace(" ", ".")
            all_objs = models.storage.all()
            if key in all_objs:
                print(all_objs[key])
            else:
                print("** no instance found **")
        else:
            print("** no instance found **")

    def do_destroy(self, line):
        """
        Behaviour:
            Del A class by <classname> <id>

        usage:
            **
            classname:
                [BaseModel, User, Place, Review, State, City, Amenity]
            **
            (hbnb) destroy <classname> <id>
        """

        if line == "":
            print("** class name missing **")
        elif line.split(" ")[0] not in classes:
            print("** class doesn't exist **")
        elif len(line.split(" ")) == 1:
            print("** instance id missing **")
        elif line.count(" ") == 1:
            key = line.replace(" ", ".")
            all_objs = models.storage.all()
            if key in all_objs:
                models.storage._FileStorage__objects.pop(key)
                models.storage.save()
            else:
                print("** no instance found **")
        else:
            print("** no instance found **")

    def do_all(self, line):
        """
        Behaviour:
            all returnes all classes or class specified by <classname> <id>

        usage:
            **
            classname:
                [BaseModel, User, Place, Review, State, City, Amenity]
            **
            (hbnb) all     <classname> -returnes specified-
            (hbnb) all     -returnes all-
        """

        if line in classes or len(line) == 0:
            all_objs = models.storage.all()
            i = 0
            print("[\"", end="")
            for key in all_objs.keys():
                if key.count(line) == 1 or len(line) == 0:
                    print(all_objs[key], end="")
                    i += 1
                    if i != len(all_objs):
                        print(", ", end="")
            print("\"]")
        else:
            print("** class doesn't exist **")

    def do_update(self, line):
        """
        Behaviour:
            Update A class by <classname> <id>

        usage:
            **
            classname:
                [BaseModel, User, Place, Review, State, City, Amenity]
            **
            (hbnb) update <classname> <id> <attribute_name> <attribute_value>
        """

        if line == "":
            print("** class name missing **")
        elif line.split(" ")[0] not in classes:
            print("** class doesn't exist **")
        elif len(line.split(" ")) == 1:
            print("** instance id missing **")
        elif line.count(" ") >= 3:
            key = line.split(" ")
            objKey = key[0] + "." + key[1]
            all_objs = models.storage.all()
            if objKey in all_objs:
                if key[2] not in ("id", "created_at", "updated_at") and not len(re.findall(r'(\{[^{}]+\})', line)) >= 1:
                    all_objs[objKey].__dict__[key[2]] = key[3]\
                        .replace("\"", "").replace("\'", "")
                    models.storage.save()
                else:
                    #print(line)
                    #print(re.findall(r'(\{[^{}]+\})', line)[0])
                    dic = json.loads(re.findall(r'(\{[^{}]+\})', line)[0])
                    for key, value in dic.items():
                            setattr(all_objs[objKey], key, value)
                    models.storage.save()
            else:
                print("** no instance found **")
        elif line.count(" ") == 1:
            print("** attribute name missing **")
        else:
            print("** value missing **")

    def do_count(self, line):
        """Counts class instances """
        all_objs = models.storage.all()
        i = 0
        if line in classes or len(line) == 0:
            for key in all_objs.keys():
                if key.count(line) == 1 or len(line) == 0:
                    i += 1
            print(i)
        else:
            print("** class doesn't exist **")

    def precmd(self, line):
        opts = re.findall(r'(\{[^{}]+\})', line)
        #print(opts)
        splits = line.split(".")

        if splits[0] in classes:

            if not splits[1].count("-") >= 4 and not line.count(" ") >= 1 and not line.count("\"") >= 1:
                line = splits[1] + " " + splits[0]
                line = line.replace("(", "").replace(")", "")
            else:
                replace = line.replace("(", ".").replace(")", ".")\
                    .replace("\"", "").replace("\'", "").replace(",", "")
                split = replace.split(".")

                if not len(re.findall(r'(\{[^{}]+\})', line)) >= 1:
                    if replace.count(split[0]) < 2:
                        line = split[1] + " " + split[0] + " " + split[2]
                    else:
                        line = split[1] + " " + split[0] + " " + split[3]
                else:
                    if replace.count(split[0]) < 2:
                        line = split[1] + " " + split[0] + " " + split[2]\
                            .split("{")[0] + " " + opts[0].replace("\'", "\"")
                    else:
                        line = split[1] + " " + split[0] + " " + split[3]\
                            .split("{")[0] + " " + opts[0].replace("\'", "\"")
                #print(replace)
                print(split)
                print(line)
        #print(line)
        return cmd.Cmd.precmd(self, line) 

if __name__ == '__main__':
    HBNBCommand().cmdloop()
