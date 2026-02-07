import axios from "axios";

const axiosClinet = axios.create({
    baseURL: process.env.BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClinet;
