import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000/";

axios.defaults.withCredentials = true;

axios.defaults.withXSRFToken = true;
axios.defaults.headers.common["Accept"] = "application/json";
export default axios;