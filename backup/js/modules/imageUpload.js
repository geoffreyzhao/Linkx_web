var imageUpload = function(fileId, typeId, foreignId) {
    //var form = document.forms[formId];
    var fileInput = $('#' + fileId).get(0);
    console.log(fileInput);
    if (fileInput.files.length > 0)
    {
        var file = fileInput.files[0];
        // try sending
        var reader = new FileReader();
        //Trigger it when finish reading file.
        reader.onloadend = function() {
            if (reader.error) {
                console.log(reader.error);
            } else {
                //document.getElementById("bytesRead").textContent = file.size;
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'v1.0/photo?fileName=' + file.name + '&typeId=' + typeId + '&foreignId=' + foreignId);
                xhr.overrideMimeType("application/octet-stream");
                if(!XMLHttpRequest.prototype.sendAsBinary){
                  XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
                    function byteValue(x) {
                      return x.charCodeAt(0) & 0xff;
                    }
                    var ords = Array.prototype.map.call(datastr, byteValue);
                    var ui8a = new Uint8Array(ords);
                    this.send(ui8a.buffer);
                  };
                }
                xhr.sendAsBinary(reader.result);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            console.log("upload complete");
                            console.log("response: " + xhr.responseText);
                        }
                    }
                };
            }
        };
        //read file
        reader.readAsBinaryString(file);
    }
};