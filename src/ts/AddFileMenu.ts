import {SourceControlEnum} from './SourceControlEnum';
import {AddFileDialog} from './AddFileDialog';
import {GitFileManager} from './GitFileManager';
import {TFVCFileManager} from './TFVCFileManager';
import {FileManager} from "./FileManager";
import {IFileManager} from "./FileManager";

export class AddFileMenu {
    private actionContext;

    public execute(actionContext) {
        actionContext.getSourceItemContext().then((sourceContext) => {
            this.actionContext = sourceContext;
            this.showDialog();
        });
    }

    private getSourceControlType() {
        if (this.actionContext.gitRepository) {
            return SourceControlEnum.Git;
        }
        else {
            return SourceControlEnum.TFVC
        }
    }

    private showDialog() {
        VSS.getService("ms.vss-web.dialog-service").then((dialogSvc:IHostDialogService) => {
            var addFileDialog:AddFileDialog;
            var sourceControlType = this.getSourceControlType();

            // contribution info
            var extInfo = VSS.getExtensionContext();
            var dialogContributionId = extInfo.publisherId + "." + extInfo.extensionId + "." + "createNewFileDialog";

            var callBack;
            var fileManager:IFileManager = null;
            if (sourceControlType == SourceControlEnum.Git) {
                fileManager = new GitFileManager(this.actionContext);
            }
            else {
                fileManager = new TFVCFileManager(this.actionContext);
            }
            fileManager.checkDuplicateFile = fileManager.checkDuplicateFile;
            fileManager.hideDuplicateFileError = fileManager.hideDuplicateFileError;
            fileManager.saveFileInRepository = fileManager.saveFileInRepository;
            fileManager.showDuplicateFileError = fileManager.showDuplicateFileError;
            fileManager.actionContext = fileManager.actionContext;
            callBack = fileManager.saveFileInRepository;

            var dialogOptions = {
                title: "Create new file",
                draggable: true,
                modal: true,
                okText: "Create",
                cancelText: "Cancel",
                height:400,
                okCallback: callBack,
                defaultButton: "ok",
                getDialogResult: function () {
                    return addFileDialog ? addFileDialog.getFormInputs() : null;
                },
            };

            dialogSvc.openDialog(dialogContributionId, dialogOptions).then((dialog) => {
                dialog.getContributionInstance("createNewFileDialog").then((createNewFileDialogInstance:AddFileDialog) => {
                    addFileDialog = createNewFileDialogInstance;
                    addFileDialog.setVersionControl(sourceControlType);
                    addFileDialog.setFileManager(fileManager);

                    var path = "";

                    if (sourceControlType == SourceControlEnum.Git) {
                        path = this.actionContext.gitRepository.name + this.actionContext.item.path;
                    }
                    else {
                        path = this.actionContext.item.path;
                    }

                    addFileDialog.setCurrentPath(path);
                    addFileDialog.onStateChanged(function (isValid) {
                        dialog.updateOkButton(isValid);
                    });

                    addFileDialog.initialValidate();
                });
            })
        })
    }
}