import BaseClass from '../../prototype/baseClass'

class Cites extends BaseClass {
  constructor() {
    super();
    this.suggestion = this.suggestion.bind(this);
    this.location = this.location.bind(this);
    this.detailLocation = this.detailLocation.bind(this);
  }

  //输入地址关键词找位置
  async suggestion(req, res, next) {
    let {keyword} = req.query;
    if (!keyword) {
      res.send({
        status: -1,
        message: '位置搜索失败，参数有误！'
      })
      return;
    }
    try {
      let data = await this.locationSearch(keyword)
      res.send({
          status: 200,
          message: "获取位置信息成功",
          data: data
        }
      )
    } catch (err) {
      console.log('获取位置信息失败', err);
      res.send({
        status: -1,
        message: '获取位置信息失败'
      })
    }
  }

  //定位当前位置
  async location(req, res, next) {
    let result = await this.getLocation(req, res);
    let data = await this.getDetailPosition(result, res, (data) => {
      res.send({
          status: 200,
          message: "获取位置信息成功",
          data
        }
      )
    });
  }

  async detailLocation(req, res, next) {
    let location = req.query.location;
    console.log('location', location)
    let data = await this.getDetailPosition(location)
    res.send({
        status: 200,
        message: "获取位置信息成功",
        data
      }
    )

  }
}

export default new Cites();