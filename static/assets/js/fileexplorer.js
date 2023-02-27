var operationpaths=[];
localStorage.clear();


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

function handle_explorer_breadscumb(items=array(), rootfolder){
    $('.fileexplorerinnermenu').empty()
    var breadscumb="";
    var appenditem="";
    var lastindex=items.length-1;
    var openurl=window.location.origin+'/documents/open-folder'
   
    items.forEach((element) => {
        console.log(items)
        console.log(lastindex)
        console.log(items.indexOf(element))
        
        if(element=="root"){
            folderpath=rootfolder
            var id="rootdirs"
            element="Root"
        }else{
            appenditem=appenditem+"\\"+element
            folderpath=rootfolder+appenditem
            var id="";
        }
        if(element==".user_specific_trash"){
            element=".Trash"
        }
        breadscumb+='<div><a class="folder" href="'+openurl+'" data-url="'+folderpath+'" id="'+id+'"><img src="/static/assets/images/files/folder.png" alt="img" class="br-7"><p>'+element+'</p></a></div>'
        if(items.indexOf(element) < lastindex){
            breadscumb+='<i class="sub-angle fa fa-chevron-right"></i>'
        }
    });
    $('.fileexplorerinnermenu').append(breadscumb)
    
}
 
/* rendering the file folder of specific path */
function renderItem(response){
    $('#parentdir').empty();
    const obj = JSON.parse(response.items);
    var zipurl=window.location.origin+'/documents/zip-folder'
    var deleteurl=window.location.origin+'/documents/delete-file-folder'
    var extracturl=window.location.origin+'/documents/extract-file'
    var downloadurl=window.location.origin+'/documents/download-file'
    var renameurl=window.location.origin+'/documents/rename-file-folder'
    var openurl=window.location.origin+'/documents/open-folder'

    var markeditems=JSON.parse(localStorage.getItem('items'))
    
    
    $.each (obj, function (index) {


        var checkedstatus = jQuery.inArray(obj[index].path, markeditems) === -1 ? "" : "checked";

        if(obj[index].is_folder==true){
           
            var extractdom=''
            
            var dom='<img src="/static/assets/images/files/folder.png" alt="img" class="br-7">'
            var dom2='<a class="folder" href="'+openurl+'"  data-url="'+obj[index].path+'">';
            
            var zipdom='<a class="dropdown-item archieve" data-url="'+zipurl+'" href="#"><i class="fe fe-download mr-2"></i>Archieve</a>'
            var dropdowndom='<div aria-labelledby="dropdownMenuButtonAction" class="dropdown-menu" data-path="'+obj[index].path+'" data-name="'+obj[index].name+'">'
            var downloaddom='';
        }else{
            
            var zipdom='';
            var extractdom=''
            var dropdowndom='<div aria-labelledby="dropdownMenuButtonAction" class="dropdown-menu" data-path="'+obj[index].path+'" data-name="'+obj[index].name+'" data-extension="'+obj[index].extension+'">'
            var dom2='<a data-url="'+obj[index].path+'">';
            var downloaddom='<a class="dropdown-item downloadfile" download href="'+obj[index].media_url+'"><i class="fe fe-download mr-2"></i> Download</a>'
            if(obj[index].extension=='jpg' || obj[index].extension=='png' || obj[index].extension=='jpeg'){
                var src=obj[index].media_url ;
                var dom='<img src="'+src+'" alt="img" class="br-7">'
            }else if(obj[index].extension=='mp3' || obj[index].extension=='mp4' || obj[index].extension=='mkv'){
                var dom='<div class="file-manger-icon"><i class="fa fa-music text-secondary"></i></div>';
            }else if(obj[index].extension=='doc' || obj[index].extension=='docx'){
                var dom='<img src="/static/assets/images/files/word.png" alt="img" class="br-7">'
            }else if(obj[index].extension=='pdf'){
                var dom='<img src="/static/assets/images/files/file.png" alt="img" class="br-7">'
            }else if(obj[index].extension=='zip' || obj[index].extension=='rar'){
                var extractdom='<a class="dropdown-item extractfile" data-url="'+extracturl+'" href="#"><i class="fe fe-download mr-2"></i>Extract</a>'
                var dom='<img src="/static/assets/images/files/zip.png" alt="img" class="br-7">'
            }else{
                var dom='<img src="/static//assetsimages/fies/file.png" alt="img" class="br-7">'
            }
            
        }
    
        $('#parentdir').append('<div class="col-xl-3 col-md-4 col-sm-6">'+
        '<div class="card border p-0 shadow-none">'+
            '<div class="d-flex align-items-center justify-content-between px-3 pt-3">'+
            '<label class="custom-control custom-checkbox">'+
            '<input type="checkbox" '+checkedstatus+' class="custom-control-input filefoldercheck" data-path="'+obj[index].path+'" name="example-checkbox2" value="option2">'+
            '<span class="custom-control-label"></span>'+
            '</label>'+
            '<div class="float-right ml-auto">'+
            '<div class="btn-group ml-3 mb-0">'+
            '<a href="#" class="option-dots btn dropdown-toggle dropdown-toggle-action" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>'+
            dropdowndom+
            '<a class="dropdown-item  renamefilefolder" data-name="'+obj[index].name+'" href="'+renameurl+'"><i class="fe fe-edit mr-2"></i> Rename</a>'+
            '<a class="dropdown-item" href="#"><i class="fe fe-share mr-2"></i> Share</a>'+
            downloaddom+
            zipdom+
            extractdom+
            '<a class="dropdown-item deletefilefolder" href="'+deleteurl+'"><i class="fe fe-trash mr-2"></i> Delete</a>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '<div class="card-body pt-0 text-center">'+
            '<div class="file-manger-icon">'+
            dom2+
                        
            dom+
                        
            '</a>'+
            '</div>'+
            '<h6 class="mb-1 font-weight-semibold fs-14 mt-4">'+obj[index].name+'</h6>'+
            '<span class="text-muted fs-13">'+obj[index].size+'</span>'+
            '</div>'+
            '</div>'+
            '</div>');
        
    });
    $('#parentdir').attr('data-path', response.path)

}

/* used to send request to server to create the folder  */
$(document).ready(function(){
    $('#foldercreationform').submit(function(e){
        e.preventDefault();
        url=$(this).attr('action');
        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'path':$('#parentdir').attr('data-path'),
            'name':$('#dirname').val()
        }
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            success: function(response) {
                if(response.msg=="directory already exists"){
                    $('#NewFolderModal').modal('hide')

                    $('#dirname').val('');
                    
                    toastr.warning('Folder Already Exists')
                }else{
                    renderItem(response)
                    $('#NewFolderModal').modal('hide');
                    $('#dirname').val('');
                    toastr.success('Folder Created Successfully')

                }
                
                
            },
            error: function(response) {
                alert('error')
                
            }
        });
    })


    /*  used to open the folder of different layers */
    $(document).delegate('.folder', 'click', function(e){
    
        e.preventDefault();
        url=$(this).attr('href');
        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'path':$(this).attr('data-url')
        }
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            success: function(response) {
                renderItem(response)
                var root=$('#rootdirs').attr('data-url')
                
                var parentdir=$('#parentdir').attr('data-path')
                var replacedurl=parentdir.replace(root, 'root')
                var splittedurl=replacedurl.split("\\")
                
                handle_explorer_breadscumb(splittedurl, root);
                if(parentdir.includes('.user_specific_trash')){
                    $('.uploadfiles').addClass("disabled");
                    $('.createfolders').addClass("disabled");
                }else{
                    $('.uploadfiles').removeClass("disabled");
                    $('.createfolders').removeClass("disabled");
                }
                
            },
            error: function(response) {
                alert('error')
                
            }
        });


    })

    /* used to create the archieve of folder i.e create zip of folders  */
    $(document).delegate('.archieve', 'click', function(e){
        e.preventDefault();
        url=$(this).attr('data-url');
        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'folderpath':$(this).parents('.dropdown-menu').attr('data-path'),
            'parentfolder':$('#parentdir').attr('data-path'),
            'name':$(this).parents('.dropdown-menu').attr('data-name')
        }
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            success: function(response) {
                renderItem(response)
                toastr.success('Folder Archieved Successfully')

            },
            error: function(response) {
                alert('error')
                
            }
        });

    })




    /* used to check(Mark) the file and folder for bulk operations like bulk detete, move, copy  */
    var operationpaths=[];
    $(document).delegate('.filefoldercheck', 'click', function(e){
        lengths=$('.filefoldercheck:checked').length;
        var parentdirectory=$('#parentdir').attr('data-path');
        var deletePernamantly=window.location.origin+'/documents/delete-permanently-from-trash'
        var restoretrash=window.location.origin+'/documents/restore-from-trash'
        if(lengths > 0){
            if(lengths == 1){
                var bulkdeleteurl=window.location.origin+'/documents/bulk-delete-file-folder'
                $('#cpymvanddltsection').empty();
                if(parentdirectory.includes('.user_specific_trash')){
                    $('#cpymvanddltsection').append('<div class="multipleinner"><div class="col-md-4 text-center"><a href="'+restoretrash+'" type="button" id="restoretrash" data-toggle="tooltip" data-placement="top" title="Restore"><i class="fas fa-trash-restore"></i></a></div><div class="col-md-4 text-center"><a href="'+deletePernamantly+'" type="button" data-toggle="tooltip" id="trashdelete" data-action="delete" class="" data-placement="top" title="Delete"><i class="fas fa-trash"></i></a></div></div>')
                }else{
                    $('#cpymvanddltsection').append('<div class="multipleinner"><div class="col-md-4 text-center"><a type="button" data-action="copy" class="copymovebtn" data-toggle="tooltip" data-placement="top" title="Copy"><i class="fas fa-copy"></i></a></div><div class="col-md-4 text-center"><a type="button" data-toggle="tooltip" data-action="move" class="copymovebtn" data-placement="top" title="Move"><i class="fas fa-dolly"></i></a></div><div class="col-md-4 text-center"><a type="button" data-url="'+bulkdeleteurl+'" id="bulkdelete" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fas fa-trash"></i></a></div></div>')

                }
                
            }

        }else{
            $('#cpymvanddltsection').empty();
        }

      
        var items=$(this).attr('data-path');


        if ($(this).is(':checked')) {

            operationpaths.push(items)

        }else{
            operationpaths = operationpaths.filter(item => item !== items)
        }

        localStorage.setItem("items", JSON.stringify(operationpaths));

    })


    /* used to get specific files according to their types */
    $('.especificxtension').click(function(e){
        e.preventDefault();
        url=$(this).attr('href');
        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'filetype': $(this).attr('data-type'),
            'rootdirectory': $('#rootdirs').attr('data-url')
        }
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            success: function(response) {
                renderItem(response)
                $('.uploadfiles').removeClass("disabled");
                $('.createfolders').removeClass("disabled");
                operationpaths=[];
                localStorage.clear();

            },
            error: function(response) {
                alert('error')
                
            }
        });

    })


    $('.trashed').click(function(e){
        e.preventDefault();
        url=$(this).attr('href');
        var openurl=window.location.origin+'/documents/open-folder'
        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'parentpath': $(this).attr('data-path'),
        }
        var rootfolder=$('#rootdirs').attr('data-url');
        var folderpath=rootfolder+"\\.user_specific_trash"
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            success: function(response) {
                renderItem(response)
                $('.fileexplorerinnermenu').empty();
                breadscumb=`
                    <div>
                        <a class="folder" href="${openurl}" data-url="${rootfolder}" id="rootdirs">
                            <img src="/static/assets/images/files/folder.png" alt="img" class="br-7">
                            <p>Root</p>
                        </a>
                    </div>
                    <i class="sub-angle fa fa-chevron-right"></i>
                    <div>
                        <a class="folder" href="${openurl}" data-url="${folderpath}" id="rootdirs">
                            <img src="/static/assets/images/files/folder.png" alt="img" class="br-7">
                            <p>.Trash</p>
                        </a>
                    </div>
                    `
                $('.fileexplorerinnermenu').append(breadscumb);

                operationpaths=[];
                localStorage.clear();
                $('.uploadfiles').addClass("disabled");
                $('.createfolders').addClass("disabled");

            },
            error: function(response) {
                alert('error')
                
            }
        });

    })

    /* used to delete the single item that might be file or folder  */
    $(document).delegate('.deletefilefolder', 'click', function(e){
        
        e.preventDefault();
       
        
        var url=$(this).attr('href');
        
        var name=$(this).parents('.dropdown-menu').attr('data-name');
        
        
        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'folderpath':$(this).parents('.dropdown-menu').attr('data-path'),
            'parentfolder':$('#parentdir').attr('data-path'),
            'name':$(this).parents('.dropdown-menu').attr('data-name'),
            'trashpath': $('.trashed').attr('data-path')
        }

       
        
        
        swal({
            title: "Are you sure to delete "+name+" ?",
            text: "Once deleted, you will not be able to recover this data!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: url,
                    type: 'post',
                    data: data,
                    success: function(response) {
                        toastr.success('Item Deleted Successfully')
                        renderItem(response)
                       
                    },
                    error: function() {
                        alert('error')
                        
                    }
                });
            }
        });

    })

    
    /* used to delete the files and folders in bulk alfer check operation is performed to mark folders and files */
    $(document).delegate('#bulkdelete', 'click', function(e){
        e.preventDefault();
        var url=$(this).attr('data-url');
        var folderpaths=localStorage.getItem("items");

        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'folderpath':folderpaths,
            'parentfolder':$('#parentdir').attr('data-path'),
            'name':$(this).parents('.dropdown-menu').attr('data-name'),
            'trashpath': $('.trashed').attr('data-path')
        }
        swal({
            title: "Are you sure to delete?",
            text: "Once deleted, you will not be able to recover this data!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: url,
                    type: 'post',
                    data: data,
                    success: function(response) {
                        localStorage.clear();                     
                        renderItem(response);
                        $('#cpymvanddltsection').empty();
                        toastr.success('Items Deleted Successfully')
                        operationpaths=[];

                        
                    },
                    error: function() {
                        alert('error')
                        
                    }
                });
            }
        });

    })


    /* used to delete the files and folders permanently from trash */
    $(document).delegate('#trashdelete', 'click', function(e){
        e.preventDefault();
        var url=$(this).attr('href');
        var folderpaths=localStorage.getItem("items");

        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'folderpath':folderpaths,
            'parentfolder':$('#parentdir').attr('data-path'),
        }
        swal({
            title: "Are you sure to delete?",
            text: "Once deleted, you will not be able to recover this data!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: url,
                    type: 'post',
                    data: data,
                    success: function(response) {
                        localStorage.clear();                     
                        renderItem(response);
                        $('#cpymvanddltsection').empty();
                        toastr.success('Items Deleted Successfully')
                        operationpaths=[];

                        
                    },
                    error: function() {
                        alert('error')
                        
                    }
                });
            }
        });

    })

    
    $(document).delegate('#restoretrash', 'click', function(e){
        e.preventDefault();
        var url=$(this).attr('href');
        var folderpaths=localStorage.getItem("items");

        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'folderpath':folderpaths,
            'parentfolder':$('#parentdir').attr('data-path'),
            'root': $('#rootdirs').attr('data-url'),
        }

        console.log('ssssssssssssssss')
        console.log(data)
        console.log('ppppppppppppppppppppppppppppppp')
        
        swal({
            title: "Are you sure to restore?",
            text: "Once deleted, you will not be able to recover this data!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: url,
                    type: 'post',
                    data: data,
                    success: function(response) {
                        localStorage.clear();                     
                        renderItem(response);
                        $('#cpymvanddltsection').empty();
                        toastr.success('Items Deleted Successfully')
                        operationpaths=[];

                        
                    },
                    error: function() {
                        alert('error')
                        
                    }
                });
            }
        });
    })


    
    /* used to rename the folder and files specially to show the popup models with the item name to be edited  */
    $(document).delegate('.renamefilefolder', 'click', function(e){
        e.preventDefault(); 
        var name=$(this).attr('data-name');
        var splitname=name.split(".");
        var folderpath = $(this).parents('.dropdown-menu').attr('data-path');
        $('#renameFileFolderModal').modal('show')
        $('#dirfilename').val(splitname[0]);
        $("#filfolpath").val(folderpath);
        $("#parentfolder").val($('#parentdir').attr('data-path'));
    })

    /* used to send new name to the server to complete the rename operation */
    $("#folderfilerenameform").submit(function(e){
        e.preventDefault();
        $('#renamebutton').prop('disabled', true)
        url=$(this).attr('action');
        $.ajax({
            url: url,
            type: 'post',
            data: $(this).serialize(),
            success: function(response) {
                $('#renameFileFolderModal').modal('hide')
                renderItem(response);
                toastr.success('Item Renamed Successfully')
                $('#renamebutton').prop('disabled', false)

            },
            error: function() {
                alert('error');
                $('#renamebutton').prop('disabled', false)

                
            }
        });

    })


    /* used to search the files and folders of different layers */
    $('#searchfilefolder').keyup(function(){
        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'parentfolder':$('#parentdir').attr('data-path'),
            'value':$(this).val()
        }
        $.ajax({
            url: $(this).attr('data-url'),
            type: 'post',
            data: data,
            success: function(response) {
                renderItem(response); 
            },
            error: function() {
                alert('error')
                
            }
        });


    })



    /* used to show the popup models to upload files in the specific folder */
    $('#UploadFileModel').on('show.bs.modal', function (e) {
        parenturls=$('#parentdir').attr('data-path')
        $('#ppaths').val(parenturls)
        //console.log(parenturls);
    })



    /* used to extract any uploaded archieved files or newly generated zipped files */
    $(document).delegate('.extractfile', 'click', function(e){
        e.preventDefault();
        url=$(this).attr('data-url');
        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'folderpath':$(this).parents('.dropdown-menu').attr('data-path'),
            'parentfolder':$('#parentdir').attr('data-path'),
            'name':$(this).parents('.dropdown-menu').attr('data-name')
        }
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            success: function(response) {
                renderItem(response)
                toastr.success('File Extracted Successfully')

            },
            error: function(response) {
                alert('error')
                
            }
        });

    })


    /* used to distinguish the copy or move opertion after files and folders are checked */
    $(document).delegate('.copymovebtn', 'click', function(e){
        var action=$(this).attr('data-action');
        var urls=window.location.origin+"/documents/bulk-move-copy-file-folder";
        $('#cpymvanddltsection').empty();
        var action=localStorage.setItem('action', action);
        $('#cpymvanddltsection').append('<div class="multipleinner"><div class="col-md-12 text-center"><a type="button" data-url="'+urls+'" data-toggle="tooltip" class="pastebtn" data-placement="top" title="Paste"><i class="fas fa-paste"></i></a></div></div>');


    })


    /* used to paste the copied or cut items the specific directory */
    $(document).delegate('.pastebtn', 'click', function(e){
        var folderpaths=localStorage.getItem("items");
        var action=localStorage.getItem("action");

        data={
            'csrfmiddlewaretoken': $('meta[name="csrf-token"]').attr('content'),
            'folderpath':folderpaths,
            'parentfolder':$('#parentdir').attr('data-path'),
            'action':action
        }
        url=$(this).attr('data-url');

        $.ajax({
            url: url,
            type: 'post',
            data: data,
            success: function(response) {               
                renderItem(response);
                $('#cpymvanddltsection').empty();
                localStorage.clear();  
                operationpaths=[];

            },
            error: function(response) {
                alert('error')
                
            }
        });


    })




    $(document).delegate('.downloadfile', 'click', function(e){
        
    })



final_url = $('#newdropZoneForm').attr('action')

   

   
Dropzone.options.newdropZoneForm = {
    url: 'consultancy/file-explorer/file-upload',
    addRemoveLinks: true,
    method: "POST",
    //params: 'file_upload',
    params: {'path':"path"},
    maxFilesize: 256 * 4 * 2,
    dictFileTooBig: "File is too big.",
    autoProcessQueue: false,
    acceptedFiles: '.png, .jpg,.gif,.bmp,.jpeg',
    uploadMultiple: true,
    dictDefaultMessage: "Drag and Drop files here to upload",
    parallelUploads: 10,
    maxFiles: 12,
    clickable: true,
    headers: {      
        'Access-Control-Request-Headers':'authorization,cache-control,x-requested-with',
        'Access-Control-Allow-Origin':'*'

    },
   
    init: function () {
        // var mydropzone = this;
        // $("#submit-all").click(function (evt) {
        //     evt.preventDefault();
        //     evt.stopPropagation();
        // });
        // this.on("addedfile", function(file) { alert("Added file."); });


    },
    
    success: function(response) {
       // console.log('response' + response);
       
       renderItem(response)
    },
};
Dropzone.options.newdropZoneForm.init();


   

    

})