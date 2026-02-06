import axios from "axios";

const axiosClinet = axios.create({
    baseURL: "http://localhost:1200",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClinet;
