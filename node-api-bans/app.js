const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// 加载配置
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 初始化数据存储
const dataPath = path.join(__dirname, 'bans.json');
let bans = [];
try {
  bans = JSON.parse(fs.readFileSync(dataPath, 'utf8')) || [];
} catch (e) {
  console.log('初始化新的封禁数据文件');
  fs.writeFileSync(dataPath, JSON.stringify(bans, null, 2));
}

// 保存数据到文件
function saveData() {
  fs.writeFileSync(dataPath, JSON.stringify(bans, null, 2));
}

// API密钥验证中间件
function authenticate(req, res, next) {
  console.log('原始请求头:', req.headers);
  console.log('字符串化请求头:', JSON.stringify(req.headers));

  // 尝试获取各种可能的请求头格式
  const possibleKeys = [
    'x-api-key', 'X-Api-Key', 'x-apikey', 'X-Apikey',
    'x_api_key', 'X_Api_Key', 'x_apikey', 'X_Apikey'
  ];

  let token;
  for (const key of possibleKeys) {
    if (req.headers[key]) {
      token = req.headers[key];
      break;
    }
  }

  console.log('接收到的API密钥:', token);
  console.log('配置的API密钥:', config.apiKey);

  if (!token) {
    console.log('错误: 缺少API密钥');
    return res.status(401).json({ error: '缺少API密钥' });
  }

  if (token.trim() !== config.apiKey.trim()) {
    console.log('错误: 无效的API密钥');
    return res.status(403).json({ error: '无效的API密钥' });
  }

  console.log('API密钥验证通过');
  next();
}

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 添加测试数据（仅当bans为空时）
if (bans.length === 0) {
  const now = new Date();
  bans = [
    {
      id: 1,
      nickname: 'testuser1',
      reason: '测试封禁1',
      admin: 'admin1',
      isPermanent: false,
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 86400000).toISOString(), // 1天后
      isReleased: false
    },
    {
      id: 2,
      nickname: 'testuser2',
      reason: '测试封禁2',
      admin: 'admin2',
      isPermanent: true,
      startTime: now.toISOString(),
      endTime: null,
      isReleased: false
    }
  ];
  saveData();
}

// 添加封禁记录
app.post('/ban', authenticate, (req, res) => {
  const { nickname, reason, admin, isPermanent, duration } = req.body;

  if (!nickname || !reason || !admin) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const now = new Date();
  const newBan = {
    id: bans.length + 1,
    nickname,
    reason,
    admin,
    isPermanent: Boolean(isPermanent),
    startTime: now.toISOString(),
    endTime: isPermanent ? null : new Date(now.getTime() + (duration || config.permanentBanDuration)).toISOString(),
    isReleased: false
  };

  bans.push(newBan);
  saveData();

  res.status(201).json(newBan);
});

// 获取所有封禁记录
app.get('/bans', authenticate, (req, res) => {
  res.json(bans);
});

// 获取封禁统计
app.get('/stats', authenticate, (req, res) => {
  const stats = {
    total: bans.length,
    active: bans.filter(ban => !ban.isReleased && (!ban.endTime || new Date(ban.endTime) > new Date())).length,
    released: bans.filter(ban => ban.isReleased || (ban.endTime && new Date(ban.endTime) <= new Date())).length
  };

  res.json(stats);
});

// 更新封禁状态
app.patch('/ban/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { isReleased } = req.body;

  const ban = bans.find(b => b.id === Number(id));
  if (!ban) {
    return res.status(404).json({ error: '未找到封禁记录' });
  }

  ban.isReleased = Boolean(isReleased);
  saveData();

  res.json(ban);
});

// 启动服务器
app.listen(config.port, () => {
  console.log(`封禁API服务运行在端口 ${config.port}`);
});

process.on('SIGINT', () => {
  saveData();
  process.exit();
});
