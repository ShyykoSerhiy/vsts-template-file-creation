import {FileManager, IFileManager} from './FileManager';
import {AddFileDialog, IFormInput} from './AddFileDialog';
import * as Q from 'q';

var reqJs = (window as any).requirejs;
var VCContracts, RestClient;

reqJs(['TFS/VersionControl/Contracts', 'TFS/VersionControl/TfvcRestClient'], function (_VCContracts, _RestClient) {
    VCContracts = _VCContracts;
    RestClient = _RestClient;
});

export class TFVCFileManager extends FileManager implements IFileManager {
    constructor(actionContext) {
        super(actionContext);
        this.saveFileInRepository = this.saveFileInRepository.bind(this);
    }

    public saveFileInRepository(result:IFormInput) {
        var tfvcClient = RestClient.getClient();

        var path = this.actionContext.item.path + "/" + result.fileName;

        var data = {
            comment: result.comment,
            changes: [{
                changeType: VCContracts.VersionControlChangeType.Add,
                item: {
                    path: path,
                    isFolder: false,
                    contentMetadata: {
                        encoding: 65001 //magic constant for UTF-8
                    }
                },
                newContent: {
                    content: result.content,
                    contentType: VCContracts.ItemContentType.RawText
                }
            }]
        };

        (<any>tfvcClient).createChangeset(data).then(
            () => {
                this.refreshBrowserWindow();
            }
        );
    }

    public checkDuplicateFile(fileName:string):IPromise<boolean> {
        var deferred = Q.defer<boolean>();

        var tfvcClient = RestClient.getClient();

        var path = this.actionContext.item.path + "/" + fileName;

        tfvcClient.getItems(undefined, path, VCContracts.VersionControlRecursionType.OneLevel,
            false, undefined).then((itemsMetaData) => {
            if (TFVCFileManager.checkFileExists(tfvcClient, path, itemsMetaData)) {
                deferred.resolve(true);
            }
            else {
                deferred.resolve(false);

            }
        });

        return deferred.promise;
    }

    private static checkFileExists(tfvcClient:any, path:string, itemsMetaData:any) {
        for (var i = 0; i < itemsMetaData.length; i++) {
            var current = itemsMetaData[i];
            if (current.path.indexOf(path) === 0) {
                return true;
            }
        }

        return false;
    }
}