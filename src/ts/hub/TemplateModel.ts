export interface TemplateParamModel {
    name: string,
    value: string
}

export interface TemplateModel {
    title: string,
    nameTemplate: string,
    template: string,
    templateParams: TemplateParamModel[]
}