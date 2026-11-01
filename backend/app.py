import os
import json
from datetime import datetime  # 👈 新增这一行
from flask import Flask, jsonify, request, send_from_directory
# ... 其他 import 保持不变 ...
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json, os, uuid

import os
# ... 其他 import ...

# 定义前端文件夹路径 (注意 .. 表示上一级目录)
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')

# 修改第8行，指定静态文件夹
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# 拼接 soups.json 的绝对路径
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "soups.json")
sessions = {}

def load_soups():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

@app.route('/api/soups', methods=['GET'])
def get_soups():
    soups = load_soups()
    # 获取前端的参数
    category = request.args.get('category', '')
    search = request.args.get('search', '')
    # 筛选经典题
    featured = request.args.get('featured', '')
    
    filtered_soups = soups

    # 1. 如果请求经典题，优先返回经典题
    if featured == 'true':
        # 你可以把 id 为 1, 40, 21 等定义为经典题
        classic_ids = [1, 40, 21, 34] 
        filtered_soups = [s for s in soups if s['id'] in classic_ids]
    else:
        # 2. 按分类筛选
        if category:
            filtered_soups = [s for s in filtered_soups if s['category'] == category]
        
        # 3. 按关键词搜索
        if search:
            search_lower = search.lower()
            filtered_soups = [s for s in filtered_soups 
                              if search_lower in s['title'].lower() or 
                                 search_lower in s['face'].lower()]
    
    # 返回筛选后的数据（包含汤底，前端负责控制隐藏）
    return jsonify([{
        "id": s["id"], 
        "category": s["category"], 
        "title": s["title"], 
        "face": s["face"], 
        "clues": s["clues"],
        "truth": s["truth"]  # 👈 加上这一行，把汤底也传给前端
    } for s in filtered_soups])
# === 把下面这段加在这里 ===
@app.route('/api/soup/<int:soup_id>')
def get_soup(soup_id):
    soups = load_soups()
    soup = next((s for s in soups if s['id'] == soup_id), None)
    if soup:
        return jsonify(soup)
    return jsonify({'error': '未找到该题目'}), 404

@app.route("/api/game/start", methods=["POST"])
def start_game():
    sid = uuid.uuid4().hex[:8]
    data = request.json
    soup_id = data.get("soupId")
    sessions[sid] = {"soupId": soup_id, "log": []}
    return jsonify({"sessionId": sid})

@app.route("/api/game/ask", methods=["POST"])
def ask():
    data = request.json
    sid = data.get("sessionId")
    question = data.get("question", "").strip()
    if sid not in sessions:
        return jsonify({"error": "会话不存在"}), 404
    sessions[sid]["log"].append({"q": question, "a": "待主持人判定"})
    return jsonify({"answer": "待主持人判定"})

@app.route("/api/correction", methods=["POST"])
def correction():
    path = os.path.join(os.path.dirname(__file__), "data", "corrections.json")
    items = []
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                items = json.load(f)
        except:
            items = []
    items.append(request.json)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False)
    return jsonify({"ok": True})

@app.route("/")
def home():
    # 注意：这里的 .. 代表退回上一级目录，也就是从 backend 退回到 turtle-soup
    frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
    return send_from_directory(frontend_path, "index.html")

# ==================== 接口 3：接收纠错建议并发送邮件 ====================
@app.route('/api/submit', methods=['POST'])
def submit_feedback():
    data = request.json
    soup_title = data.get('soup_title', '未指定题目')
    feedback_text = data.get('feedback', '')

    # 1. 构建要收集的数据
    new_feedback = {
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "soup_title": soup_title,
        "feedback": feedback_text
    }

    # 2. 定义收集箱文件路径 (存放在 backend/data/corrections.json)
    FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), 'data', 'corrections.json')

    # 3. 读取已有的数据（如果文件不存在或为空，就返回空列表）
    items = []
    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(FEEDBACK_FILE, 'r', encoding='utf-8') as f:
                items = json.load(f)
        except json.JSONDecodeError:
            items = []
            
    # 4. 追加新数据并保存
    items.append(new_feedback)
    with open(FEEDBACK_FILE, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=4)

    return jsonify({"msg": "反馈提交成功！感谢您的建议。"}), 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)