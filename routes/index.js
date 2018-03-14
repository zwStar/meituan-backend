import v1 from './v1'
import admin from './admin'
import statistics from './statistics'
import service from './service'
export default app => {
    app.use('/v1', v1);
    app.use('/admin', admin);
    app.use('/statistics',statistics);
    app.use('/service',service);
}