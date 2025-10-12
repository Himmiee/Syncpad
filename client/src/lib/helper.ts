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
