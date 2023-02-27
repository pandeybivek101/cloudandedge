import fsutil
from django.conf import settings
import math
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Trash

class FileExplorerMixin(LoginRequiredMixin):

    def convert_size(self, size_bytes):
        if size_bytes == 0:
            return "0B"
        size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
        i = int(math.floor(math.log(size_bytes, 1024)))
        p = math.pow(1024, i)
        s = round(size_bytes / p, 2)
        return "%s %s" % (s, size_name[i])

    def recored_deleted_items(self, source, current_path):
        Trash.objects.create(source=source, current_path=current_path)
        return 

    
    def handle_trashable(self, source, current_path, trashable):
        parent_dir = fsutil.get_parent_dir(source, levels=1)
        if trashable == True:
            self.recored_deleted_items(parent_dir, current_path)
        return

    def handle_move_directory(self, item, parentpath, trashable):
        bname = fsutil.get_file_basename(item)
        pathforcheck=parentpath+'\\'+bname
        
        if(fsutil.exists(pathforcheck)):
            pass
        else:
            fsutil.move_dir(item, parentpath, overwrite=True) 
            self.handle_trashable(item, pathforcheck, trashable)
        return None

    def handle_move_file(self, item, parentpath, trashable):
        try:
            fsutil.move_file(item, parentpath, overwrite=False)
            basename = fsutil.get_filename(item)
            self.handle_trashable(item, parentpath+"\\"+basename, trashable)
        except OSError as error:
            pass 
        return None
    
    def get_file_by_type(self, path, lst, specific):
        dirfilename = fsutil.list_dirs(path)
        file_filename=fsutil.list_files(path)
        for fle in file_filename:
            if fsutil.get_file_extension(fle) in lst:
                specific.append(fle)
        for dirs in dirfilename:
            self.get_file_by_type(dirs, lst, specific)
        return specific

    def get_file_folder(self, path, dirs=None, files=None):
        if path is not None:
            dirfilename = fsutil.list_dirs(path)
            file_filename=fsutil.list_files(path)
        else:
            dirfilename = dirs
            file_filename = files
        items=[]
        
        for dirs in dirfilename:
            if(fsutil.get_filename(dirs)==".user_specific_trash"):
                continue
            else:
                dirs_dict = {"name" : fsutil.get_filename(dirs), "is_folder" : fsutil.is_dir(dirs), "path":dirs, "size":fsutil.get_dir_size_formatted(dirs)}
            dictionary_copy = dirs_dict.copy()
            items.append(dictionary_copy)
        for fle in file_filename:
            splitted=fle.split('/')
            media_url='/media/'+splitted[1]+'/'+splitted[2]
            dirs_dict = {"name" : fsutil.get_filename(fle),  "is_folder" : fsutil.is_dir(fle),"is_file" : fsutil.is_file(fle), "path":fle, "size":fsutil.get_file_size_formatted(fle), "extension":fsutil.get_file_extension(fle), 'media_url':media_url}
            dictionary_copy = dirs_dict.copy()
            items.append(dictionary_copy)
        return items