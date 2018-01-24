
import mongoose from 'mongoose';


mongoose.connect('mongodb://zwStar:adgjmp123@119.29.82.47:27017/meituan', {server:{auto_reconnect:true}});
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.once('open' ,() => {
  console.log('连接数据库成功')
})

db.on('error', function(error) {
  console.error('Error in MongoDb connection: ' + error);
  mongoose.disconnect();
});

db.on('close', function() {
  console.log('数据库断开，重新连接数据库');
  mongoose.connect('mongodb://zwStar:adgjmp123@119.29.82.47:27017/meituan', {server:{auto_reconnect:true}});
});

export default db;
