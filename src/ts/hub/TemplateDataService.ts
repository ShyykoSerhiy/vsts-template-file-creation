import * as Q from 'q';
import {TemplateModel} from "./TemplateModel";

const FILE_TEMPLATES_KEY = 'file-templates';
const defaultTemplates = [{
    title: 'Java Class',
    nameTemplate: '{{name}}.java',
    template: 'public class {{name}} {\n}',
    templateParams: []
}, {
    title: 'Java Interface',
    nameTemplate: '{{name}}.java',
    template: 'public interface {{name}} {\n}',
    templateParams: []
}, {
    title: 'Java Enum',
    nameTemplate: '{{name}}.java',
    template: 'public enum {{name}} {\n}',
    templateParams: []
}, {
    title: 'Java AnnotationType',
    nameTemplate: '{{name}}.java',
    template: 'public @interface {{name}} {\n}',
    templateParams: []
}, {
    title: 'Java Singleton',
    nameTemplate: '{{name}}.java',
    template: "public class {{name}}{\n" +
    "    private static {{name}} instance = new {{name}}();\n" +
    "\n" +
    "    public static {{name}} getInstance() {\n" +
    "        return instance;\n" +
    "    }\n" +
    "\n" +
    "    private {{name}}() {\n" +
    "    }\n" +
    "}",
    templateParams: []
}];


export class TemplateDataService {
    public static getTemplates() {
        var deferred = Q.defer<TemplateModel[]>();
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (dataService:any) {
            dataService.getValue(FILE_TEMPLATES_KEY).then(function (value) {
                var templates;
                try {
                    templates = JSON.parse(value);
                } catch (ex) {
                    templates = defaultTemplates;
                }
                deferred.resolve(templates);
            });
        });
        return deferred.promise;
    }

    public static setTemplates(templateModels:TemplateModel[]) {
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (dataService:any) {
            dataService.setValue(FILE_TEMPLATES_KEY, JSON.stringify(templateModels)).then(function (value) {
                //template saved
                //todo
            });
        });
    }
}