import {IFormInput} from "./AddFileDialog";
export interface IFileManager {
    actionContext:any;
    saveFileInRepository(result:IFormInput);
    checkDuplicateFile(fileName:string): IPromise<boolean>;
    showDuplicateFileError(fileName:string):void;
    hideDuplicateFileError():void;
}

export class FileManager {
    public actionContext;

    constructor(actionContext) {
        this.actionContext = actionContext;
    }

    protected refreshBrowserWindow() {
        VSS.getService<IHostNavigationService>(VSS.ServiceIds.Navigation)
            .then((navigationService) => {
                navigationService.reload();
            });
    }

    public showDuplicateFileError(fileName:string) {
        $(".error-container").text("The file " + fileName + " already exists");
    }

    public hideDuplicateFileError() {
        $(".error-container").text("");
    }
}
    