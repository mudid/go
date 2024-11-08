document.addEventListener('DOMContentLoaded', function() {
  const noteInput = document.getElementById('noteInput');
  const searchBtn = document.getElementById('searchBtn');
  const results = document.getElementById('results');

  // 保存笔记
  noteInput.addEventListener('keypress', async function(e) {
    if (e.key === 'Enter' && noteInput.value.trim()) {
      try {
        const response = await fetch('http://localhost:3000/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: noteInput.value.trim()
          })
        });

        if (response.ok) {
          noteInput.value = '';
          showMessage('笔记已保存！');
        } else {
          showMessage('保存失败，请重试！');
        }
      } catch (error) {
        showMessage('保存失败：' + error.message);
      }
    }
  });

  // 搜索笔记
  searchBtn.addEventListener('click', async function() {
    const keyword = noteInput.value.trim();
    if (!keyword) {
      showMessage('请输入搜索关键词');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/notes/search?keyword=${encodeURIComponent(keyword)}`);
      const notes = await response.json();

      results.innerHTML = '';
      if (notes.length === 0) {
        showMessage('没有找到匹配的笔记');
      } else {
        notes.forEach(note => {
          const div = document.createElement('div');
          div.className = 'result-item';
          
          // 修改日期处理逻辑
          let formattedDate = note.created_at || note.createdAt || '时间未知';
          try {
            const timestamp = new Date(formattedDate);
            if (!isNaN(timestamp)) {
              formattedDate = timestamp.toLocaleDateString('zh-CN', {
                month: 'numeric',
                day: 'numeric'
              }) + ' ' + timestamp.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          } catch (error) {
            console.error('日期格式化错误:', error);
            formattedDate = '时间未知';
          }
          
          div.innerHTML = `<span class="timestamp">[${formattedDate}]</span> ${note.content}`;
          results.appendChild(div);
        });
      }
    } catch (error) {
      showMessage('搜索失败：' + error.message);
    }
  });

  function showMessage(msg) {
    results.innerHTML = `<div class="result-item">${msg}</div>`;
  }
}); 