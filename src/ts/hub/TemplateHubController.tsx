import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {TemplateHub} from './TemplateHub';
import {TemplateModel} from "./TemplateModel";
import {TemplateDataService} from './TemplateDataService';

interface TemplateHubState {
    selectedTemplateModel? : TemplateModel;
    changedSelectedTemplateModel?: TemplateModel;
    templateModels : TemplateModel[];
}

var copyState = function copy(state:TemplateHubState):TemplateHubState {
    return JSON.parse(JSON.stringify(state)); // fixme move to imutablejs
};

export class TemplateHubController {
    private hubMountPoint:Element;

    private state:TemplateHubState;

    constructor() {
        var hubMountPoint = document.querySelector('#hubMountPoint');
        if (!hubMountPoint) {
            return;
        }
        this.hubMountPoint = hubMountPoint;
        this.state = {
            templateModels: []
        };

        TemplateDataService.getTemplates().then((templates:TemplateModel[])=> {
            var state = copyState(this.state);
            state.templateModels = templates;
            if (templates[0]) {
                state.selectedTemplateModel = templates[0];
                state.changedSelectedTemplateModel = templates[0];
            }
            this.setState(state);
        });

        this.rerender();
    }

    private onTemplateElementInListClicked(template:TemplateModel) {
        var state = copyState(this.state);
        state.selectedTemplateModel = template;
        state.changedSelectedTemplateModel = template;
        this.setState(state);
    }

    private onSelectedElementChange(template:TemplateModel) {
        var state = copyState(this.state);
        state.changedSelectedTemplateModel = template;
        this.setState(state);
    }

    private onNewTemplateClicked() {
        var state = copyState(this.state);
        var newTemplate:TemplateModel = {
            title: 'New Template',
            nameTemplate: '{{name}}',
            template: 'template...',
            templateParams: []
        };
        state.selectedTemplateModel = newTemplate;
        state.changedSelectedTemplateModel = newTemplate;
        state.templateModels.push(newTemplate);
        this.setState(state);
    }

    private onSaveClicked(oldTemplateModel:TemplateModel, newTemplateModel:TemplateModel) {
        if (!newTemplateModel.title || newTemplateModel.title === '') {
            window.alert(`The title of the template may not be empty.`);
            return;
        }
        var state = copyState(this.state);
        state.selectedTemplateModel = newTemplateModel;
        state.changedSelectedTemplateModel = newTemplateModel;
        var findByTitle = (templateModel:TemplateModel) => {
            return (el:TemplateModel)=> {
                return el.title === templateModel.title;
            }
        };
        var oldIndex = state.templateModels.findIndex(findByTitle(oldTemplateModel));
        var newIndex = state.templateModels.findIndex(findByTitle(newTemplateModel));
        if (newIndex >= 0 && oldIndex !== newIndex) {
            window.alert(`Template with title=${newTemplateModel.title} already exists.`);
            return;
        }

        state.templateModels.splice(oldIndex, 1, newTemplateModel);
        this.setState(state);
    }

    private setState(templateHubState:TemplateHubState) {
        this.state = templateHubState;
        TemplateDataService.setTemplates(this.state.templateModels);
        this.rerender();
    }

    private rerender():void {
        if (!this.hubMountPoint) {
            return;
        }

        ReactDOM.render(
            <div>
                <TemplateHub
                    onTemplateElementInListClicked={this.onTemplateElementInListClicked.bind(this)}
                    onSaveClicked={this.onSaveClicked.bind(this)}
                    onNewTemplateClicked={this.onNewTemplateClicked.bind(this)}
                    onSelectedElementChange={this.onSelectedElementChange.bind(this)}
                    selectedTemplateModel={this.state.selectedTemplateModel}
                    changedSelectedTemplateModel={this.state.changedSelectedTemplateModel}
                    templateModels={this.state.templateModels}/>
            </div>,
            this.hubMountPoint
        );
    }
}
