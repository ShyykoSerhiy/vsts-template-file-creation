import {AddFileDialog} from './AddFileDialog';
import {AddFileMenu} from './AddFileMenu';
import {TemplateHubController} from './hub/TemplateHubController';

VSS.register("createNewFileDialog", function (context) {
    var addFileDialog = new AddFileDialog();
    addFileDialog.setVersionControl = addFileDialog.setVersionControl;//fixme fixing the bug in the vsts?
    addFileDialog.setFileManager = addFileDialog.setFileManager;
    addFileDialog.setCurrentPath = addFileDialog.setCurrentPath;
    addFileDialog.onStateChanged = addFileDialog.onStateChanged;
    addFileDialog.initialValidate = addFileDialog.initialValidate;
    addFileDialog.getFormInputs = addFileDialog.getFormInputs;
    addFileDialog.onFormChanged = addFileDialog.onFormChanged;
    return addFileDialog;
});
VSS.register("addFile", function (context) {
    var temp = new AddFileMenu();
    temp.execute = temp.execute; //fixme fixing the bug in the vsts?
    return temp;
});
//template hub
new TemplateHubController();