/**
 * This class allows creation of zip files without any compression
 *
 * @private
 */
Ext.define('Ext.exporter.file.zip.Archive', {
    extend: 'Ext.exporter.file.Base',

    requires: [
        'Ext.exporter.file.zip.Folder'
    ],

    config: {
        folders: [],
        files: []
    },

    destroy: function(){
        this.callParent();
        this.setFolders(null);
        this.setFiles(null);
    },

    applyFolders: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.zip.Folder');
    },

    applyFiles: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.zip.File');
    },

    updateFiles: function(collection, oldCollection){
        var me = this;

        if(oldCollection){
            oldCollection.un({
                add: me.onFileAdd,
                remove: me.onFileRemove,
                scope: me
            });
        }
        if(collection){
            collection.on({
                add: me.onFileAdd,
                remove: me.onFileRemove,
                scope: me
            });
            me.onFileAdd(collection, {items: collection.getRange()});
        }
    },

    onFileAdd: function(collection, details){
        var folders = this.getFolders(),
            items = details.items,
            length = items.length,
            i, item, folder;

        for(i = 0; i < length; i++) {
            item = items[i];
            folder = this.getParentFolder(item.getPath());
            if(folder) {
                folders.add({
                    path: folder
                });
            }
        }
    },

    onFileRemove: function(collection, details){
        Ext.destroy(details.items);
    },

    getParentFolder: function(path){
        var lastSlash;

        if (path.slice(-1) == '/') {
            path = path.substring(0, path.length - 1);
        }
        lastSlash = path.lastIndexOf('/');

        return (lastSlash > 0) ? path.substring(0, lastSlash + 1) : "";
    },

    addFile: function(config){
        return this.getFiles().add(config || {});
    },
    removeFile: function(config){
        return this.getFiles().remove(config);
    },

    getContent: function(){
        var fileData = '',
            dirData = '',
            localDirLength = 0,
            centralDirLength = 0,
            decToHex = Ext.util.Format.decToHex,
            files = Ext.Array.merge( this.getFolders().getRange(), this.getFiles().getRange()),
            len = files.length,
            dirEnd, i, file, header;

        // this method uses code from https://github.com/Stuk/jszip

        for(i = 0; i < len; i++){
            file = files[i];
            header = file.getHeader(localDirLength);
            localDirLength += header.fileHeader.length + header.data.length;
            centralDirLength += header.dirHeader.length;
            fileData += header.fileHeader + header.data;
            dirData += header.dirHeader;
        }

        dirEnd =
                // central directory end
            "PK\x05\x06" +
                // number of this disk
            "\x00\x00" +
                // number of the disk with the start of the central directory
            "\x00\x00" +
                // total number of entries in the central directory on this disk
            decToHex(len, 2) +
                // total number of entries in the central directory
            decToHex(len, 2) +
                // size of the central directory   4 bytes
            decToHex(centralDirLength, 4) +
                // offset of start of central directory with respect to the starting disk number
            decToHex(localDirLength, 4) +
                // .ZIP file comment length
            "\x00\x00";

        fileData += dirData + dirEnd;

        return fileData;
    }
});