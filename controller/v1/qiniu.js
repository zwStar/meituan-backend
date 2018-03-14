//七牛云上传token
import Config from '../../config'
import qiniu from 'qiniu'
class Qiniu {
    constructor(){
        this.uploadToken = this.uploadToken.bind(this);
        this.mac = new qiniu.auth.digest.Mac(Config.AccessKey, Config.SecretKey);
        let options = {
            scope: Config.Bucket,
            deleteAfterDays: 7,
        };
        this.putPolicy = new qiniu.rs.PutPolicy(options);
        // let bucketManager = new qiniu.rs.BucketManager(mac, null);
    }
    uploadToken(req,res,next){
        let token = this.putPolicy.uploadToken(this.mac);
        if (token) {
            res.json({
                uptoken: token
            });
        }
    }
}

export default new Qiniu();
