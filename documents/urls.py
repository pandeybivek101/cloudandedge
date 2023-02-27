
"""Fmanager URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""



from django.urls import path
from documents.views import *
from documents import views

urlpatterns = [
    path('', DocumentPage.as_view(), name='document-page'),

    path('create-folder', CreateFolderView.as_view(), name='create-folder'),
    path('open-folder', OpenFolderView.as_view(), name='open-folder'),
    path('file-upload', FileUploadView.as_view(), name='file-upload'),
    path('zip-folder', CreateZipView.as_view(), name='create-zip'),
    path('delete-file-folder', DeleteFileFolderView.as_view(), name='delete-file-folder'),
    path('bulk-delete-file-folder', BulkDeleteFileFolderView.as_view(), name='bulk-delete-file-folder'),
    path('extract-file', ExtractFileFolderView.as_view(), name='extract-file'),
    path('download-file', DownloadFileView.as_view(), name='download-file'),
    path('rename-file-folder', RenameFileFolderView.as_view(), name='rename-file-folder'),
    path('search-file-folder', SearchFileFolderView.as_view(), name='search-file-folder'),
    path('bulk-move-copy-file-folder', BulkMoveCopyFileFolderView.as_view(), name='bulk-copy-move-file-folder'),
    path('get-specfic-file-type', GetSpecificTypeFileView.as_view(), name='get-specific-file-type'),
    path('get-trash-items', GetTrashItemsView.as_view(), name='get-trash-items'),
    path('delete-permanently-from-trash', DeletePermanentlyFromTrashView.as_view(), name='delete-permanently-from-trash'),
    path('restore-from-trash', RestoreFromTrashView.as_view(), name='restore-from-trash'),
   
]