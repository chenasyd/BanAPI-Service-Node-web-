# BanAPI-Service-Node-web-
与BanAPIspigot插件配套的BanAPIService
系统要求
Node.js 14.0.0 或更高版本
npm 6.0.0 或更高版本
操作系统：Windows、macOS 或 Linux
安装步骤
1. 下载项目文件
将项目文件解压到您选择的目录中。

2. 安装依赖
打开命令行终端，进入项目目录：
cd 项目目录/node-api-bans
安装所需依赖：
npm install
这将安装 Express、body-parser、cors 等必要的依赖包。

配置说明
配置文件位于 config.json，您可以根据需要修改以下参数：
{
  "port": 5000,
  "apiKey": "bans-api-secret-key-12345",
  "permanentBanDuration": 2592000000
}
参数说明：
port: API服务运行的端口号
apiKey: 访问API所需的密钥
permanentBanDuration: 默认封禁时长（毫秒），当未指定封禁时长时使用
数据存储
封禁数据存储在 bans.json 文件中。该文件会在首次运行时自动创建，无需手动配置。

启动和停止服务
启动服务
在项目目录中运行：
node app.js
成功启动后，您将看到以下消息：
封禁API服务运行在端口 5000
以后台服务方式运行
如果您希望API在后台运行，可以使用 PM2：

# 安装PM2
npm install -g pm2

# 启动服务
pm2 start app.js --name "bans-api"

# 查看运行状态
pm2 status

# 查看日志
pm2 logs bans-api
停止服务
如果是直接运行，按 Ctrl+C 停止服务。

如果使用 PM2，运行：
pm2 stop bans-api
API使用方法
认证
所有API请求都需要在请求头中包含 x-api-key 字段：
x-api-key: bans-api-secret-key-12345

API端点
1. 获取所有封禁记录
URL: /bans
方法: GET
请求头:
x-api-key: bans-api-secret-key-12345
响应格式: JSON数组
响应示例:
[
  {
    "id": 1,
    "nickname": "testuser1",
    "reason": "测试封禁1",
    "admin": "admin1",
    "isPermanent": false,
    "startTime": "2023-08-01T08:00:00.000Z",
    "endTime": "2023-08-02T08:00:00.000Z",
    "isReleased": false
  }
]
2. 添加封禁记录
URL: /ban
方法: POST
请求头:
x-api-key: bans-api-secret-key-12345
Content-Type: application/json
请求体格式: JSON
请求体示例:
{
  "nickname": "用户名",
  "reason": "封禁原因",
  "admin": "管理员名称",
  "isPermanent": false,
  "duration": 86400000
}
响应格式: JSON对象
响应示例:
{
  "id": 3,
  "nickname": "用户名",
  "reason": "封禁原因",
  "admin": "管理员名称",
  "isPermanent": false,
  "startTime": "2023-08-01T08:00:00.000Z",
  "endTime": "2023-08-02T08:00:00.000Z",
  "isReleased": false
}
3. 获取封禁统计
URL: /stats
方法: GET
请求头:
x-api-key: bans-api-secret-key-12345
响应格式: JSON对象
响应示例:
{
  "total": 2,
  "active": 2,
  "released": 0
}
4. 更新封禁状态
URL: /ban/:id
方法: PATCH
请求头:
x-api-key: bans-api-secret-key-12345
Content-Type: application/json
请求体格式: JSON
请求体示例:
{
  "isReleased": true
}
响应格式: JSON对象
响应示例:
{
  "id": 1,
  "nickname": "testuser1",
  "reason": "测试封禁1",
  "admin": "admin1",
  "isPermanent": false,
  "startTime": "2023-08-01T08:00:00.000Z",
  "endTime": "2023-08-02T08:00:00.000Z",
  "isReleased": true
}
使用示例
使用curl
1. 获取所有封禁记录:

curl -H "x-api-key: bans-api-secret-key-12345" http://localhost:5000/bans
2. 添加封禁记录:

curl -X POST -H "x-api-key: bans-api-secret-key-12345" -H "Content-Type: application/json" -d "{\"nickname\":\"testuser3\",\"reason\":\"测试封禁3\",\"admin\":\"admin3\",\"isPermanent\":false}" http://localhost:5000/ban
3. 获取封禁统计:

curl -H "x-api-key: bans-api-secret-key-12345" http://localhost:5000/stats
4. 更新封禁状态:

curl -X PATCH -H "x-api-key: bans-api-secret-key-12345" -H "Content-Type: application/json" -d "{\"isReleased\":true}" http://localhost:5000/ban/1
使用JavaScript
// 获取所有封禁记录
fetch('http://localhost:5000/bans', {
  headers: {
    'x-api-key': 'bans-api-secret-key-12345'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// 添加封禁记录
fetch('http://localhost:5000/ban', {
  method: 'POST',
  headers: {
    'x-api-key': 'bans-api-secret-key-12345',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nickname: '用户名',
    reason: '封禁原因',
    admin: '管理员名称',
    isPermanent: false
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
