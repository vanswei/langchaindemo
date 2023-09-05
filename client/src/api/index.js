import axios from "axios";

export function fetchChat(message, history) {
  return axios.post("/api/agent", {
    message,
    history,
  });

}