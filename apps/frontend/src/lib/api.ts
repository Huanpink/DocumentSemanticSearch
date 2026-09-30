import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8484/api'

// Khởi tạo axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Timeout 30 giây
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Chạy trước khi request được gửi đi
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (nếu ứng dụng có dùng xác thực)
    const token = localStorage.getItem('access_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Chạy khi nhận được response từ server
apiClient.interceptors.response.use(
  (response) => {
    // Có thể bóc tách data luôn để các hàm gọi API ngắn gọn hơn
    // Tuỳ vào chuẩn API của Backend trả về
    return response.data
  },
  (error) => {
    // Xử lý các mã lỗi HTTP phổ biến
    if (error.response) {
      const { status } = error.response

      switch (status) {
        case 401:
          // Unauthorized: Token hết hạn hoặc chưa đăng nhập
          console.error('Phiên đăng nhập hết hạn hoặc không hợp lệ')
          localStorage.removeItem('access_token')
          // window.location.href = '/login' // Uncomment để tự động redirect về trang đăng nhập
          break
        case 403:
          // Forbidden: Không đủ quyền truy cập
          console.error('Bạn không có quyền thực hiện thao tác này')
          break
        case 404:
          console.error('Không tìm thấy dữ liệu')
          break
        case 413:
          console.error('File tải lên quá lớn')
          break
        case 500:
          console.error('Lỗi máy chủ (Internal Server Error)')
          break
        default:
          console.error('Đã xảy ra lỗi hệ thống')
      }
    } else if (error.request) {
      // Request đã gửi nhưng server không phản hồi (Lỗi mạng hoặc server sập)
      console.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.')
    } else {
      // Lỗi do cấu hình request
      console.error('Lỗi cấu hình:', error.message)
    }

    return Promise.reject(error)
  }
)


export default apiClient
