import {FileManager, IFileManager} from './FileManager';
import {SourceControlEnum} from './SourceControlEnum';
import {GitFileManager} from './GitFileManager';
import {TFVCFileManager} from './TFVCFileManager';
import {TemplateDataService} from './hub/TemplateDataService';
import {TemplateModel} from "./hub/TemplateModel";
import * as Handlebars from 'handlebars';

export interface IFormInput {
    fileName: string;
    content: string;
    comment: string;
}
var reqJs = (window as any).requirejs;

export class AddFileDialog {
    private selectedTemplate:TemplateModel;

    constructor() {
        $("#fileName").on('input propertychange paste', (event:any) => {
            if (window.event && event.type == "propertychange" && event.propertyName != "value")
                return;

            window.clearTimeout((<any>$(this).data("timeout")));
            $(this).data("timeout", setTimeout(() => {
                this.triggerCallbacks();
            }, 500));
        });
        var me = this;
        reqJs(["VSS/Controls", "VSS/Controls/Combos"], function (Controls, Combos) {
            TemplateDataService.getTemplates().then((templates:TemplateModel[]) => {
                me.selectedTemplate = templates[0];
                var combo = Controls.create(Combos.Combo, document.querySelector('.templateCombo'), {
                    source: templates.map((templateModel:TemplateModel)=> {
                        return templateModel.title;
                    }),
                    value: templates[0].title,
                    change: ()=> {
                        me.selectedTemplate = templates.find((template:TemplateModel)=> {
                            return template.title === combo.getText();
                        });
                        me.validateState();
                    }
                });
                me.validateState();
            });
        });
    }

    private formChangedCallbacks = [];
    private stateChangedCallback = [];
    private versionControlType:SourceControlEnum;
    private fileManager:IFileManager;


    private getFormInput():IFormInput {
        if (!this.selectedTemplate) {
            return {
                fileName: $("#fileName").val(),
                comment: $("#comment").val(),
                content: ''
            };
        }
        var template = Handlebars.compile(this.selectedTemplate.template);
        var nameTemplate = Handlebars.compile(this.selectedTemplate.nameTemplate);
        var context = {name: $("#fileName").val()};

        return {
            fileName: nameTemplate(context),
            comment: $("#comment").val(),
            content: template(context)
        };
    }

    private triggerCallbacks() {
        var formInput = this.getFormInput();
        this.formChangedCallbacks.forEach(function (callback) {
            callback(formInput);
        });

        this.validateState();
    }

    private validateState() {
        var formInput = this.getFormInput();

        var isValid = true;

        if (!formInput.fileName
            || !formInput.fileName.trim()) {
            isValid = false;
        }

        if (formInput.fileName.indexOf('\\') > -1) {
            isValid = false;
        }

        if (!isValid) {
            this.stateChanged(false);
        }
        else {
            this.fileManager.checkDuplicateFile(formInput.fileName).then((isDuplicate) => {
                if (isDuplicate) {
                    this.stateChanged(false);
                    this.fileManager.showDuplicateFileError(formInput.fileName);
                }
                else {
                    this.stateChanged(true);
                    this.fileManager.hideDuplicateFileError();
                }
            })
        }
    }

    private stateChanged(state) {
        this.stateChangedCallback.forEach(function (callback) {
            callback(state);
        });
    }

    public getFormInputs() {
        return this.getFormInput();
    }

    public setFileManager(fileManager:IFileManager) {
        this.fileManager = fileManager;

    }

    public setVersionControl(type:SourceControlEnum) {
        this.versionControlType = type;
    }

    public setCurrentPath(path:string) {
        $(".directory").text(path + ".");
    }

    public onFormChanged(callback) {
        this.formChangedCallbacks.push(callback);
    }

    public onStateChanged(callback) {
        this.stateChangedCallback.push(callback);
    }

    public initialValidate() {
        this.triggerCallbacks();
    }
}