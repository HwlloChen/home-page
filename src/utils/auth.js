import { snackbar } from 'mdui';

// 简单的本地token存储与校验，优化类型和健壮性
export function setToken(token) {
  if (typeof token === 'string') {
    localStorage.setItem('admin_token', token)
  }
}

export function getToken() {
  return localStorage.getItem('admin_token') || ''
}

export function removeToken() {
  localStorage.removeItem('admin_token')
}

export function isAuthed() {
  return Boolean(getToken())
}

export async function authedFetch(url, options = {}) {
  const token = getToken()
  options = { ...options }
  if (!options.headers) options.headers = {}
  if (token) options.headers['Authorization'] = `Bearer ${token}`
  
  try {
    const response = await fetch(url, options)
    
    // 处理401错误
    if (response.status === 401) {
      removeToken() // 清除无效的token
      snackbar({ 
        message: "登录已过期，请重新登录",
        autoCloseDelay: 3000,
        placement: 'top-end'
      })
      // 刷新页面，让用户重新登录
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      return response
    }
    
    // 处理其他错误
    if (!response.ok) {
      snackbar({
        message: `请求失败: ${response.status} ${response.statusText}`,
        autoCloseDelay: 3000,
        placement: 'top-end'
      })
    }
    
    return response
  } catch (error) {
    // 处理网络错误等
    snackbar({
      message: "Network error",
      autoCloseDelay: 3000,
      placement: 'top-end'
    })
    throw error
  }
}
