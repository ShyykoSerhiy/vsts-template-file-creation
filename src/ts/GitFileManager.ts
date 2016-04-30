import {FileManager, IFileManager} from './FileManager';
import {AddFileDialog, IFormInput} from './AddFileDialog';
import * as Q from 'q';

var reqJs = (window as any).requirejs;
var VCContracts, RestClient;

reqJs(['TFS/VersionControl/Contracts', 'TFS/VersionControl/GitRestClient'], function (_VCContracts, _RestClient) {
    VCContracts = _VCContracts;
    RestClient = _RestClient;
});

export class GitFileManager extends FileManager implements IFileManager {

    constructor(actionContext) {
        super(actionContext);
        this.saveFileInRepository = this.saveFileInRepository.bind(this);
    }

    private getCommitData(branchName:string, oldCommitId:string, basePath:string, fileName:string, content:string, comment:string) {
        return {
            refUpdates: [
                {
                    name: "refs/heads/" + branchName,
                    oldObjectId: oldCommitId
                }
            ],
            commits: [
                {
                    comment: comment,
                    changes: [
                        {
                            changeType: "add",
                            item: {
                                path: basePath + "/" + fileName
                            },
                            newContent: {
                                content: content,
                                contentType: "rawtext"
                            }
                        }
                    ]
                }
            ]
        }
    }

    public checkDuplicateFile(fileName:string):IPromise<boolean> {

        var deferred = Q.defer<boolean>();
        var actionContext = this.actionContext;

        var repositoryId = actionContext.gitRepository.id;
        var branchName = actionContext.version;
        var basePath = this.actionContext.item.path;

        var gitClient = RestClient.getClient();
        var versionDescriptor:any =
        {
            version: branchName,
            versionOptions: VCContracts.GitVersionOptions.None,
            versionType: VCContracts.GitVersionType.Branch
        };

        gitClient.getItems(repositoryId, null, null, VCContracts.VersionControlRecursionType.Full, true, false, false, false, versionDescriptor)
            .then((result) => {
                if (basePath == "/") {
                    basePath = "";
                }
                var filePath = basePath + "/" + fileName;
                for (var i = 0; i < result.length; i++) {
                    var current = result[i];
                    if (current.path.length <= filePath.length
                        && current.path.indexOf(filePath) === 0) {
                        deferred.resolve(true);
                        return;
                    }
                }

                deferred.resolve(false);

            });
        return deferred.promise;
    }

    public saveFileInRepository:(result:IFormInput) => void = (result) => {
        var actionContext = this.actionContext;

        var fileName = result.fileName;
        var content = result.content;
        var repositoryId = actionContext.gitRepository.id;
        var branchName = actionContext.version;
        var basePath = this.actionContext.item ? this.actionContext.item.path : "";
        var comment = result.comment;

        var gitClient = RestClient.getClient();
        gitClient.getRefs(repositoryId, undefined, "heads/" + branchName).then(
            (refs) => {
                var oldCommitId = refs[0].objectId;

                var data = this.getCommitData(branchName, oldCommitId, basePath, fileName, content, comment);

                (<any>gitClient).createPush(data, repositoryId, undefined).then(
                    () => {
                        this.refreshBrowserWindow();
                    });
            });
    };
}
