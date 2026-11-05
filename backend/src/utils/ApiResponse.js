export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = true
    this.statusCode = statusCode
    this.message = message
    this.data = data
  }

  static ok(data, message) { return new ApiResponse(200, data, message) }
  static created(data, message = 'Created successfully') { return new ApiResponse(201, data, message) }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    })
  }
}

export const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  })
}

