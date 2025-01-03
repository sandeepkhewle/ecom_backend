class HttpException extends Error {
  public status: number;
  public message: string;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super();
    this.status = status;
    this.message = message;
    this.data = data;
    // console.error("stack error",this.stack)
  }
}

export default HttpException;
