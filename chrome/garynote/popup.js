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
  let allNotes = []; // 存储所有搜索结果
  const pageSize = 10; // 每页显示数量
  let currentPage = 1; // 当前页码

  searchBtn.addEventListener('click', async function() {
    currentPage = 1; // 重置页码
    await searchNotes();
  });

  async function searchNotes() {
    const keyword = noteInput.value.trim();
    if (!keyword) {
      showMessage('请输入搜索关键词');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/notes/search?keyword=${encodeURIComponent(keyword)}`);
      allNotes = await response.json();

      results.innerHTML = '';
      if (allNotes.length === 0) {
        showMessage('没有找到匹配的笔记');
      } else {
        displayCurrentPage();
        renderPagination();
      }
    } catch (error) {
      showMessage('搜索失败：' + error.message);
    }
  }

  function displayCurrentPage() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const currentNotes = allNotes.slice(start, end);

    results.innerHTML = '';
    currentNotes.forEach(note => {
      const div = document.createElement('div');
      div.className = 'result-item';
      
      // 创建删除按钮
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/notes/${note.id}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            // 从当前列表中移除该笔记
            allNotes = allNotes.filter(n => n.id !== note.id);
            // 如果当前页已经没有数据了，且不是第一页，则跳转到上一页
            const totalPages = Math.ceil(allNotes.length / pageSize);
            if (currentPage > totalPages && currentPage > 1) {
              currentPage--;
            }
            // 重新显示当前页
            displayCurrentPage();
            renderPagination();
            // 不再显示删除成功的消息，保持搜索结果的显示
          } else {
            // 删除失败时只显示错误消息，不影响当前显示的搜索结果
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = '删除失败，请重试！';
            results.insertBefore(errorDiv, results.firstChild);
            // 3秒后自动移除错误消息
            setTimeout(() => errorDiv.remove(), 3000);
          }
        } catch (error) {
          // 发生错误时只显示错误消息，不影响当前显示的搜索结果
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-message';
          errorDiv.textContent = '删除失败：' + error.message;
          results.insertBefore(errorDiv, results.firstChild);
          // 3秒后自动移除错误消息
          setTimeout(() => errorDiv.remove(), 3000);
        }
      };
      
      // 修改日期处理逻辑保持不变
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
      div.appendChild(deleteBtn);
      results.appendChild(div);
    });
  }

  function renderPagination() {
    const totalPages = Math.ceil(allNotes.length / pageSize);
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    
    // 创建分页容器
    const pageList = document.createElement('ul');
    pageList.className = 'page-list';
    
    // 添加上一页按钮
    if (currentPage > 1) {
      const prevLi = document.createElement('li');
      const prevLink = document.createElement('a');
      prevLink.href = '#';
      prevLink.className = 'page-link';
      prevLink.textContent = '«';
      prevLink.onclick = (e) => {
        e.preventDefault();
        currentPage--;
        displayCurrentPage();
        renderPagination();
      };
      prevLi.appendChild(prevLink);
      pageList.appendChild(prevLi);
    }

    // 添加页码
    for (let i = 1; i <= totalPages; i++) {
      const pageLi = document.createElement('li');
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.className = `page-link ${i === currentPage ? 'active' : ''}`;
      pageLink.textContent = i;
      pageLink.onclick = (e) => {
        e.preventDefault();
        currentPage = i;
        displayCurrentPage();
        renderPagination();
      };
      pageLi.appendChild(pageLink);
      pageList.appendChild(pageLi);
    }

    // 添加下一页按钮
    if (currentPage < totalPages) {
      const nextLi = document.createElement('li');
      const nextLink = document.createElement('a');
      nextLink.href = '#';
      nextLink.className = 'page-link';
      nextLink.textContent = '»';
      nextLink.onclick = (e) => {
        e.preventDefault();
        currentPage++;
        displayCurrentPage();
        renderPagination();
      };
      nextLi.appendChild(nextLink);
      pageList.appendChild(nextLi);
    }

    paginationDiv.appendChild(pageList);
    results.appendChild(paginationDiv);
  }

  function showMessage(msg) {
    results.innerHTML = `<div class="result-item">${msg}</div>`;
  }

  // 添加获取最新记录的函数
  async function fetchLatestNote() {
    try {
      const response = await fetch('http://localhost:3000/api/notes/latest');
      const note = await response.json();
      
      if (note) {
        results.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'result-item';
        
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = async () => {
          // 复用现有的删除逻辑
          try {
            const response = await fetch(`http://localhost:3000/api/notes/${note.id}`, {
              method: 'DELETE'
            });
            
            if (response.ok) {
              results.innerHTML = '';
            }
          } catch (error) {
            showMessage('删除失败：' + error.message);
          }
        };
        
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
        div.appendChild(deleteBtn);
        results.appendChild(div);
      }
    } catch (error) {
      console.error('获取最新记录失败：', error);
    }
  }

  // 添加输入框焦点事件
  noteInput.addEventListener('focus', fetchLatestNote);
}); 