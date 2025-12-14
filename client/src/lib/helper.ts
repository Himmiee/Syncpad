import { AxiosError } from "axios";

interface ApiError {
  success: false;
  error: string | Array<any>;
}

export const showErrorToaster = (error: AxiosError<ApiError>, toaster: any) => {
  const backendMessage = error.response?.data?.error;

  const description =
    typeof backendMessage === "string"
      ? backendMessage
      : Array.isArray(backendMessage) && backendMessage.length
        ? backendMessage[0].message
        : "An unexpected error occurred";

  toaster.error({
    title: "Error",
    description,
  });
};

export const getErrorMessage = (error: any, defaultMessage: string = "An error occurred") => {
  const errData = error.response?.data?.error;
  
  // Handle validation errors with details
  if (errData?.code === 'VALIDATION_ERROR' && errData?.details?.length > 0) {
    return errData.details[0].message;
  }
  
  // Handle standard error message
  if (errData?.message) {
    return errData.message;
  }
  
  // Fallback to top-level message or default
  return error.response?.data?.message || defaultMessage;
};
