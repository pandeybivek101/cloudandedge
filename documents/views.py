
from django.shortcuts import render
from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib import messages
from django.views.generic import TemplateView,ListView
from django.urls import reverse
from django.contrib.auth import authenticate,login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect,request
from django.contrib.auth.models import Group, Permission
import fsutil
import math
import os 
import json
from django.conf import settings
from django.http import JsonResponse, request
from .mixins import FileExplorerMixin
import shutil
from django.core.files.storage import FileSystemStorage
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Trash
# Create your views here.


class DocumentPage(FileExplorerMixin, View):
    template_name='documents/documentpage.html'

    def get(self,request):
        main_directory=settings.FILE_EXPLORER_PATH
        if not fsutil.exists(main_directory):
            fsutil.create_dir(main_directory, overwrite=False)
        items=self.get_file_folder(main_directory, dirs=None, files=None)
        totalsize = fsutil.get_dir_size_formatted(main_directory)
        trash_path=f"{main_directory}\\.user_specific_trash"
        context={'items':items, 'main_directory': main_directory, 'totalsize': totalsize, 'trash_path': trash_path}
        return render(request, self.template_name, context)


class CreateFolderView(FileExplorerMixin, View):
    def post(self, request):
        paths=folder_path=request.POST['path']+'/'+request.POST['name']
        try:
            fsutil.create_dir(paths, overwrite=False)
            msg="directory created"
        except OSError as error:
            msg="directory already exists"
        items=self.get_file_folder(request.POST['path'], dirs=None, files=None)
        data={
            'msg':msg,
            'path':request.POST['path'],
            'items':json.dumps(items)
        }
        
        return JsonResponse(data, safe=False)


class OpenFolderView(FileExplorerMixin, View):
    def post(self, request):
        if fsutil.is_empty_dir(request.POST['path']):
            msg='empty directory'
            items=[]
        else:
            items=self.get_file_folder(request.POST['path'], dirs=None, files=None)
            msg='not empty'
        data={
            'msg':msg,
            'path':request.POST['path'],
            'items':json.dumps(items)
        }
        return JsonResponse(data, safe=False)


class FileUploadView(FileExplorerMixin, View):

    def post(self, request):
        inf=request.FILES['file']
        target=request.POST['path']+'/'+str(inf)
        
        default_storage.save(target, ContentFile(inf.read()))
        data={
            'msg':'file uploaded successfully',
            'path':request.POST['path'],
            'items':self.get_file_folder(request.POST['path']),

        }
        return JsonResponse(data, safe=False)


class CreateZipView(FileExplorerMixin, View):
    def post(self, request):
        dirfilename = fsutil.list_dirs(request.POST['folderpath'])
        file_filename=fsutil.list_files(request.POST['folderpath'])
        contents=dirfilename+file_filename
        path=request.POST['parentfolder']+'/'+request.POST['name']+'.zip'
        fsutil.create_zip_file(path, contents, overwrite=True)
        items=self.get_file_folder(request.POST['parentfolder'], dirs=None, files=None)
        data={
            'msg':'zip created successfully',
            'items':json.dumps(items),
            'path':request.POST['parentfolder'],
        }
        return JsonResponse(data, safe=False)



class  DeleteFileFolderView(FileExplorerMixin, View):
    def post(self, request):
        deleteitem=request.POST['folderpath']
        if( fsutil.is_dir(deleteitem)==True ):
            self.handle_move_directory(deleteitem, request.POST['trashpath'], trashable=True)
            msg='Folder deleted successfully'
        else:
            self.handle_move_file(deleteitem, request.POST['trashpath'], trashable=True)
            msg='File deleted successfully'
        

        items=self.get_file_folder(request.POST['parentfolder'], dirs=None, files=None)
        data={
            'msg':msg,
            'items':json.dumps(items),
            'path':request.POST['parentfolder'],
        }
        return JsonResponse(data, safe=False)



class BulkDeleteFileFolderView(FileExplorerMixin, View):
    def post(self, request):
        for item in json.loads(request.POST['folderpath']):
            if( fsutil.is_dir(item)==True ):
                self.handle_move_directory(item, request.POST['trashpath'], trashable=True)
            else:
                self.handle_move_file(item, request.POST['trashpath'], trashable=True)
        items=self.get_file_folder(request.POST['parentfolder'], dirs=None, files=None)
        data={
            'msg':"Items deleted successfully",
            'items':json.dumps(items),
            'path':request.POST['parentfolder'],
        }
        return JsonResponse(data, safe=False)




class ExtractFileFolderView(FileExplorerMixin, View):
    def post(self, request):
        fsutil.extract_zip_file(request.POST['folderpath'], request.POST['parentfolder'], content_paths=None, autodelete=False)
        items=self.get_file_folder(request.POST['parentfolder'], dirs=None, files=None)
        data={
            'msg':"Extracted successfully",
            'items':json.dumps(items),
            'path':request.POST['parentfolder'],
        }

        return JsonResponse(data, safe=False)

    
class DownloadFileView(FileExplorerMixin, View):
    pass


class RenameFileFolderView(FileExplorerMixin, View):
    
    def post(self, request):
        parentpath=request.POST['parentfolder']
        if(fsutil.is_dir(request.POST['paths'])):
            fsutil.rename_dir(request.POST['paths'], request.POST['name'])
        else:
            extension = fsutil.get_file_extension(request.POST['paths'])
            formatted=request.POST['name']+'.'+extension
            fsutil.rename_file(request.POST['paths'], formatted)
        items=self.get_file_folder(parentpath, dirs=None, files=None)

        data={
            'msg':'renamed successfully',
            'items':json.dumps(items),
            'path':parentpath,
        }

        return JsonResponse(data, safe=False)


class BulkMoveCopyFileFolderView(FileExplorerMixin, View):

    def handle_file_folder_copy(self, parentpath, folderpaths, action):
        for item in json.loads(folderpaths):
            if(fsutil.is_dir(item)):
                if(action=='copy'):
                    try:
                        fsutil.copy_dir(item, parentpath, overwrite=False)
                    except OSError as error:
                        pass
                else:
                    self.handle_move_directory(item, parentpath, trashable=False)
            else: 
                if(action=='copy'):
                    basename = str(fsutil.get_file_basename(item))
                    extension = str(fsutil.get_file_extension(item))
                    destpath=parentpath+"\\"+basename+'.'+extension
                    try:
                        fsutil.copy_file(item, destpath, overwrite=False)
                    except OSError as error:
                        pass
                else:
                    self.handle_move_file(item, parentpath, trashable=False)
        return None
        

    def post(self, request):
        parentpath=request.POST['parentfolder']
        self.handle_file_folder_copy(request.POST['parentfolder'], request.POST['folderpath'], request.POST['action'])
       
        items=self.get_file_folder(parentpath, dirs=None, files=None)
        data={
            'msg':'successfully done',
            'items':json.dumps(items),
            'path':parentpath,
        }

        return JsonResponse(data, safe=False)



class SearchFileFolderView(FileExplorerMixin, View):
    def post(self, request):
        patterns="*"+request.POST['value']+"*"
        dirs = fsutil.search_dirs(request.POST['parentfolder'], patterns)
        files = fsutil.search_files(request.POST['parentfolder'], patterns)
        items=self.get_file_folder(path=None, dirs=dirs, files=files) if len(request.POST['value']) > 0  else self.get_file_folder(path=request.POST['parentfolder'], dirs=None, files=None)
        data={
            'msg':'successfully done',
            'items':json.dumps(items),
            'path':request.POST['parentfolder'],
        }
        return JsonResponse(data, safe=False)


class GetSpecificTypeFileView(FileExplorerMixin, View):
    def post(self, request):
        lst=list(request.POST['filetype'].split(","))
        files=self.get_file_by_type(request.POST['rootdirectory'], lst, specific=[])
        items=self.get_file_folder(path=None, dirs=[], files=files)
        data={
            'msg':'successfully done',
            'items':json.dumps(items),
            'path':request.POST['rootdirectory'],
        }
        return JsonResponse(data, safe=False)


class GetTrashItemsView(FileExplorerMixin, View):
    def post(self, request):
        path=request.POST['parentpath']
        if not fsutil.exists(path):
            fsutil.create_dir(path, overwrite=False)
        items=self.get_file_folder(path=path, dirs=None, files=None)
        data={
            'msg':'successfully done',
            'items':json.dumps(items),
            'path':request.POST['parentpath'],
        }
        return JsonResponse(data, safe=False)


class DeletePermanentlyFromTrashView(FileExplorerMixin, View):
    def post(self, request):
        for item in json.loads(request.POST['folderpath']):
            if( fsutil.is_dir(item)==True ):
                fsutil.remove_dir(item)
            else:
                fsutil.delete_file(item)
        Trash.objects.filter(current_path=item).first().delete()
        items=self.get_file_folder(request.POST['parentfolder'], dirs=None, files=None)
        data={
            'msg':"Items deleted successfully",
            'items':json.dumps(items),
            'path':request.POST['parentfolder'],
        }
        return JsonResponse(data, safe=False)


class RestoreFromTrashView(FileExplorerMixin, View):
    def post(self, request):
        for item in json.loads(request.POST['folderpath']):

            itemrecord=Trash.objects.filter(current_path=item).first()
            print(itemrecord)
            restorepath = itemrecord.source if fsutil.exists(itemrecord.source) else request.POST['root']
            if( fsutil.is_dir(item)==True ):
                self.handle_move_directory(item, restorepath, trashable=False)
            else:
                self.handle_move_file(item, restorepath, trashable=False)
            itemrecord.delete()
        items=self.get_file_folder(request.POST['parentfolder'], dirs=None, files=None)
        return JsonResponse(data, safe=False)
