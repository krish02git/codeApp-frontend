import axios from "axios";

const axiosClient = axios.create({
    baseURL:'http://localhost:1234',
    withCredentials:true,
    headers:{
        'Content-Type':'application/json'
    }
});
// axiosClient.post('/', data); // easy request to backend.
export default axiosClient;