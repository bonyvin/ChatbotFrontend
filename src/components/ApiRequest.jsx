
import axios from "axios";
export const apiCallMethod = async ({
    url,
    methodType,
    body,
    children,
  }) => {
    try {
      const response = await axios({
        method: methodType,
        url: url,
        headers: {
          "Content-Type": "application/json",
        },
        data: body,
      });
      if (typeof children === "function") {
        children(response);
      }

      console.log("api req meth:", response);
      return response;
    } catch (error) {
      return error;
    }
  };