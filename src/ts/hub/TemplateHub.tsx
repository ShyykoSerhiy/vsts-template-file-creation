import * as React from 'react';
import {TemplateModel} from "./TemplateModel";
import ReactAce from 'react-ace';

export interface ITemplateHubProps extends React.Props<TemplateHub> {
    selectedTemplateModel? : TemplateModel;
    changedSelectedTemplateModel? : TemplateModel;
    onTemplateElementInListClicked : (template:TemplateModel) => void;
    onSelectedElementChange : (template:TemplateModel) => void;
    onSaveClicked: (oldTemplateModel:TemplateModel, newTemplateModel:TemplateModel) => void;
    onNewTemplateClicked: () => void;
    templateModels : TemplateModel[];
}

export interface ITemplateHubState {
}

export class TemplateHub extends React.Component<ITemplateHubProps, ITemplateHubState> {
    constructor() {
        super();
    }

    private onSaveClicked() {
        this.props.onSaveClicked(this.props.selectedTemplateModel, this.getNewSelectedTemplateModel());
    }

    render() {
        return (
            <div className="template">
                <div className="template-list">
                    {this.createButton(this.props.onNewTemplateClicked, "Add new template", 'template-list-add-new')}
                    {this.getTemplateList()}
                </div>
                {this.getTemplateEdit()}
            </div>
        );
    }

    private handleSelectedChange() {
        const templateModel = this.getNewSelectedTemplateModel();
        this.props.onSelectedElementChange(templateModel);
    }

    private getNewSelectedTemplateModel():TemplateModel {
        var newSelectedTemplateModel:TemplateModel = JSON.parse(JSON.stringify(this.props.selectedTemplateModel));
        const newTemplate = (this.refs['ace'] as any).editor.getValue();
        const newTitle = (this.refs['title'] as any).value;
        const nameTemplate = (this.refs['nameTemplate'] as any).value;
        newSelectedTemplateModel.template = newTemplate;
        newSelectedTemplateModel.nameTemplate = nameTemplate;
        newSelectedTemplateModel.title = newTitle;
        return newSelectedTemplateModel;
    }

    private getTemplateEdit() {
        const selectedModel = this.props.changedSelectedTemplateModel;

        if (!selectedModel) {
            return (<div className="template-edit"></div>);
        }
        const selectedModelText = selectedModel.template || '';
        const {title, nameTemplate} = selectedModel;

        return (<div className="template-edit">
            <div className="template-edit-input">
                <input ref="title" value={title} onChange={this.handleSelectedChange.bind(this, 'title')}
                       className="template-edit-input-title"/>
                <input ref="nameTemplate" value={nameTemplate}
                       onChange={this.handleSelectedChange.bind(this, 'nameTemplate')}
                       className="template-edit-input-nameTemplate"/>
                <ReactAce ref="ace" value={selectedModelText} width="auto" height="auto" name="ace"
                          onChange={function(){}}/>
            </div>
            <div className="template-edit-buttons">
                {selectedModel ? this.createButton(this.onSaveClicked.bind(this), 'Save') : []}
            </div>
        </div>);
    }


    private getTemplateList() {
        const selectedTemplateTitle = this.props.selectedTemplateModel ? this.props.selectedTemplateModel.title : null;

        return this.props.templateModels.map((template:TemplateModel) => {
            var className = "template-list-item";
            if (template.title === selectedTemplateTitle) {
                className += ' selected';
            }
            return <div key={template.title} className={className}
                        onClick={this.props.onTemplateElementInListClicked.bind(this, template)}>
                {template.title}
            </div>
        }, this);
    }

    private createButton(onClick, text, classNameAdditional?) {
        classNameAdditional = classNameAdditional || '';
        var className = "ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only " + classNameAdditional;
        return <button onClick={onClick} type="button" id="ok"
                       className={className}
                       role="button">
            <span className="ui-button-text">{text}</span>
        </button>;
    }
}