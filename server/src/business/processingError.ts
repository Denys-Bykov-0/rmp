interface ProcessingErrorArgs {
  message: string;
  errorCode?: ProcessingErrorCode;
}

export class ProcessingErrorCode {
  static readonly GENERIC_ERROR = -1;
  static readonly UNAUTHORIZED = -2;
  static readonly FILE_NOT_FOUND = 1;
  static readonly FILE_PREPARATION_FAILED = 2;
  static readonly FILE_NOT_READY = 3;
  static readonly MAPPING_NOT_FOUND = 4;
}

export class ProcessingError extends Error {
  errorCode: ProcessingErrorCode;
  constructor({
    message,
    errorCode = ProcessingErrorCode.GENERIC_ERROR,
  }: ProcessingErrorArgs) {
    super(message);
    this.errorCode = errorCode;
    this.name = 'ProcessingError';
  }
}
