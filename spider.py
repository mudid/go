import requests
from bs4 import BeautifulSoup
import time

# 添加请求头，模拟浏览器访问
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

try:
    # 添加超时设置和请求头
    url = "https://www.conjugar.cn/es?verb=dar"
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()  # 检查请求是否成功
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 找到所有的超链接
    links = soup.find_all('a')
    
    # 提取并打印每个链接的文本内容
    for link in links:
        text = link.get_text().strip()
        if text:  # 只打印非空内容
            print(text)

except requests.exceptions.RequestException as e:
    print(f"请求错误: {e}")
except Exception as e:
    print(f"发生错误: {e}") 