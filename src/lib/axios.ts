import axios from "axios";

axios.defaults.baseURL = "http://192.168.1.193:8092";

axios.defaults.withCredentials = true;

axios.defaults.withXSRFToken = true;
axios.defaults.headers.common["Accept"] = "application/json";
export default axios;