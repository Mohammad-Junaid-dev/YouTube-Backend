class ApiResponse extends Error {
    constructor(statusCode, data, message = "success"){
        super(message, data)
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.success = statusCode < 400

    }
}

export {ApiResponse}